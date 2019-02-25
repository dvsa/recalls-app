const { logger } = require('cvr-common/src/logger/loggerFactory');
const Parser = require('./csvRecallsParser');
const RecallComparer = require('./recallComparer');
const DataUpdateApiClient = require('./dataUpdateApiClient');
const S3BucketObjectProperties = require('./dto/s3BucketObjectProperties');
const RecallsMakesModels = require('./dto/recallsMakesModels');
const envVariables = require('./config/environmentVariables');

class RecallDataProcessor {
  static get bufferError() { return 'Cannot parse data as it is not buffered'; }

  static get noDataError() { return 'Cannot parse empty data'; }

  static download(s3, srcBucket, srcKey, next) {
    // Download the csv file from S3
    logger.info('Downloading csv data from S3');
    s3.getObject({
      Bucket: srcBucket,
      Key: srcKey,
    },
    (err, data) => {
      if (err) {
        logger.error('Error when downloading csv file from S3 bucket:', err);
        next(err);
      } else {
        const csvBuffer = data.Body;
        if (csvBuffer == null) {
          logger.error('File is empty');
          next(new Error('Downloaded CSV file is empty'));
        } else {
          logger.info(`File length: ${data.ContentLength}, last modified: ${data.LastModified}`);
          const s3Properties = new S3BucketObjectProperties(s3, srcBucket, srcKey);
          next(null, s3Properties, csvBuffer);
        }
      }
    });
  }

  static parse(s3Properties, data, next) {
    if (!(data instanceof Buffer)) {
      logger.error(RecallDataProcessor.bufferError);
      next(new Error(RecallDataProcessor.bufferError));
    } else if (data.length === 0) {
      logger.error(RecallDataProcessor.noDataError);
      next(new Error(RecallDataProcessor.noDataError));
    } else {
      logger.info('Parsing the buffered CSV data');
      const parser = new Parser(data, 'CP1252');
      const recallsCollection = parser.parse();
      const recalls = recallsCollection.correctRecalls;
      const recallsWithMissingModel = recallsCollection.recallsWithMissingModel;

      logger.info(`Number of recalls: ${recalls.size}`);
      logger.info(`Number of recalls without model: ${recallsWithMissingModel.length}`);
      if (recalls.size === 0) {
        logger.error('Recall file is empty');
        next(new Error(RecallDataProcessor.noDataError));
      } else {
        next(null, s3Properties, recallsCollection);
      }
    }
  }

  static compare(s3Properties, recallsCollection, next) {
    logger.info('Comparing parsed CSV data with database contents');

    DataUpdateApiClient.getAllRecalls((recallsErr, previousRecalls) => {
      if (recallsErr) {
        logger.warn(`Error while fetching recalls from API: ${JSON.stringify(recallsErr)}`);
        logger.info('Unable to find modified recalls due to missing data. Skipping the comparison process');
        next(null, [], [], []);
      } else {
        DataUpdateApiClient.getAllModels((modelsErr, previousModels) => {
          DataUpdateApiClient.getAllMakes((makesErr, previousMakes) => {
            const previousRecallsMap = RecallDataProcessor.mapRecallsByMakeModelRecallNum(
              previousRecalls,
            );
            const currentRecalls = recallsCollection.correctRecalls;
            const recallsWithMissingModel = recallsCollection.recallsWithMissingModel;
            const comparer = new RecallComparer(previousRecallsMap, currentRecalls);
            const modifiedRecalls = comparer.findModifiedAndValidRecalls();
            const currentMakes = RecallComparer.extractMakesFromRecalls(currentRecalls,
              previousRecallsMap, recallsWithMissingModel);
            const currentModels = RecallComparer.extractModelsFromRecalls(currentRecalls,
              previousRecallsMap, recallsWithMissingModel);

            const deletedEntries = RecallDataProcessor.handleDeletedEntries(
              makesErr, modelsErr, comparer,
              previousMakes, currentMakes, previousModels, currentModels, recallsWithMissingModel,
            );

            if (RecallDataProcessor.isDeleteThresholdExceeded(
              deletedEntries.recalls.length, previousRecalls.length,
            )) {
              next(new Error(`Deleting ${deletedEntries.recalls.length} recalls exceeds the configured threshold (DELETE_THRESHOLD environment variable). Aborting the data update process.`));
            } else {
              const modifiedEntries = RecallDataProcessor.handleModifiedEntries(
                makesErr, modelsErr, modifiedRecalls,
                previousMakes, currentMakes, previousModels, currentModels,
              );
              next(null, s3Properties, modifiedEntries, deletedEntries);
            }
          });
        });
      }
    });
  }

  static insert(s3Properties, modifiedEntries, deletedEntries, next) {
    logger.info(`Number of modified recalls entries: ${modifiedEntries.recalls.length}`);
    logger.info(`Number of modified makes entries: ${modifiedEntries.makes.length}`);
    logger.info(`Number of modified models entries: ${modifiedEntries.models.length}`);

    DataUpdateApiClient.updateRecalls(modifiedEntries.recalls, (recallsErr) => {
      DataUpdateApiClient.updateMakes(modifiedEntries.makes, (makesErr) => {
        DataUpdateApiClient.updateModels(modifiedEntries.models, (modelsErr) => {
          RecallDataProcessor.handleUpdateError('recalls', recallsErr);
          RecallDataProcessor.handleUpdateError('makes', makesErr);
          RecallDataProcessor.handleUpdateError('models', modelsErr);

          const updateErr = recallsErr || makesErr || modelsErr;
          if (updateErr) {
            next(updateErr);
          } else {
            next(null, s3Properties, deletedEntries);
          }
        });
      });
    });
  }

  static delete(s3Properties, deletedEntries, next) {
    logger.info(`Number of recalls to delete: ${deletedEntries.recalls.length}`);
    logger.info(`Number of makes to delete: ${deletedEntries.makes.length}`);
    logger.info(`Number of models to delete: ${deletedEntries.models.length}`);

    DataUpdateApiClient.deleteRecalls(deletedEntries.recalls, (recallsErr) => {
      DataUpdateApiClient.deleteMakes(deletedEntries.makes, (makesErr) => {
        DataUpdateApiClient.deleteModels(deletedEntries.models, (modelsErr) => {
          RecallDataProcessor.handleDeletionError('recalls', recallsErr);
          RecallDataProcessor.handleDeletionError('makes', makesErr);
          RecallDataProcessor.handleDeletionError('models', modelsErr);

          const deleteErr = recallsErr || makesErr || modelsErr;

          if (deleteErr) {
            next(deleteErr);
          } else {
            next(null, s3Properties);
          }
        });
      });
    });
  }

  static copyCsvToAssets(s3Properties, next) {
    const destBucket = envVariables.assetsBucketName;
    RecallDataProcessor.copyToBucket(s3Properties, destBucket, `documents/${s3Properties.srcKey}`, (err, data) => {
      next(err, data);
    });
  }

  static isDeleteThresholdExceeded(numberOfDeletions, totalRecords) {
    const thresholdPercentagePoints = envVariables.deleteThreshold;
    const deletedRecordsPercentagePoints = numberOfDeletions / totalRecords * 100;
    const isExceeded = deletedRecordsPercentagePoints > thresholdPercentagePoints;
    logger.debug(`Does deleting ${numberOfDeletions} out of ${totalRecords} records exceed the threshold of ${thresholdPercentagePoints}%? - ${isExceeded}`);
    return isExceeded;
  }

  static handleUpdateError(typeOfData, err) {
    if (err) {
      logger.error(`Error while updating ${typeOfData}: ${err}`);
    }
  }

  static handleDeletionError(typeOfData, err) {
    if (err) {
      logger.error(`Error while deleting ${typeOfData}: ${err}`);
    }
  }

  static handleModifiedModels(modelsErr, previousModels, currentModelsMap) {
    if (modelsErr) {
      logger.warn(`Error while fetching models from API: ${JSON.stringify(modelsErr)}`);
      logger.info('Models will not be updated due to missing data');
      return [];
    }
    const previousModelsMap = RecallDataProcessor.mapModelsByTypeMake(previousModels);

    return RecallComparer.findModifiedModels(previousModelsMap, currentModelsMap);
  }

  static handleModifiedMakes(makesErr, previousMakes, currentMakesMap) {
    if (makesErr) {
      logger.warn(`Error while fetching makes from API: ${JSON.stringify(makesErr)}`);
      logger.info('Makes will not be updated due to missing data');
      return [];
    }
    const previousMakesMap = RecallDataProcessor.mapMakesByType(previousMakes);

    return RecallComparer.findModifiedMakes(previousMakesMap, currentMakesMap);
  }

  static handleDeletedMakes(makesErr, previousMakes, currentMakesMap, recallsWithMissingModel) {
    if (makesErr) {
      logger.info('Makes will not be deleted due to missing data');
      return [];
    }

    const previousMakesMap = RecallDataProcessor.mapMakesByType(previousMakes);

    return RecallComparer.findDeletedMakesPrimaryKeys(
      previousMakesMap,
      currentMakesMap,
      recallsWithMissingModel,
    );
  }

  static handleDeletedModels(modelsErr, previousModels, currentModelsMap, recallsWithMissingModel) {
    if (modelsErr) {
      logger.info('Models will not be deleted due to missing data');
      return [];
    }
    const previousModelsMap = RecallDataProcessor.mapModelsByTypeMake(previousModels);

    return RecallComparer.findDeletedModelsPrimaryKeys(previousModelsMap, currentModelsMap,
      recallsWithMissingModel);
  }

  static handleModifiedEntries(makesErr, modelsErr, modifiedRecalls,
    previousMakes, currentMakes, previousModels, currentModels) {
    return new RecallsMakesModels(
      modifiedRecalls,
      RecallDataProcessor.handleModifiedMakes(makesErr, previousMakes, currentMakes),
      RecallDataProcessor.handleModifiedModels(modelsErr, previousModels, currentModels),
    );
  }

  static handleDeletedEntries(makesErr, modelsErr, comparer,
    previousMakes, currentMakes, previousModels, currentModels, recallsWithMissingModel) {
    return new RecallsMakesModels(
      comparer.findDeletedRecallsPrimaryKeys(recallsWithMissingModel),
      RecallDataProcessor.handleDeletedMakes(makesErr, previousMakes, currentMakes,
        recallsWithMissingModel),
      RecallDataProcessor.handleDeletedModels(modelsErr, previousModels, currentModels,
        recallsWithMissingModel),
    );
  }

  /**
   * @param {RecallDbRecordDto[]} recalls
   * @returns {Map<String, RecallDbRecordDto>} recallsMap recalls mapped by make_model_recall_number
   */
  static mapRecallsByMakeModelRecallNum(recalls) {
    const mappedRecalls = new Map();
    for (const recall of recalls) {
      mappedRecalls.set(recall.make_model_recall_number, recall);
    }
    logger.info(`Mapped ${mappedRecalls.size} recalls`);
    return mappedRecalls;
  }

  /**
   * @param {ModelDbRecordDto[]} models
   * @returns {Map<String, ModelDbRecordDto>} models mapped by recall type and make
   */
  static mapModelsByTypeMake(models) {
    const mappedModels = new Map();
    for (const model of models) {
      mappedModels.set(model.type_make, model);
    }
    logger.info(`Mapped ${mappedModels.size} models`);
    return mappedModels;
  }

  /**
   * @param {MakeDbRecordDto[]} makes
   * @returns {Map<String, MakeDbRecordDto>} makes mapped by recall type
   */
  static mapMakesByType(makes) {
    const mappedMakes = new Map();
    for (const make of makes) {
      mappedMakes.set(make.type, make);
    }
    logger.info(`Mapped ${mappedMakes.size} makes`);
    return mappedMakes;
  }

  static copyToBucket(s3Properties, destBucket, destKey, callback) {
    const params = {
      Bucket: destBucket,
      CopySource: `${s3Properties.srcBucket}/${s3Properties.srcKey}`,
      Key: destKey,
    };
    logger.debug('Copying CSV file to assets bucket. Params: ', params);
    s3Properties.s3.copyObject(params, (err, data) => {
      if (err) {
        logger.error('Error while copying CSV file to assets bucket', err);
        callback(err);
      } else {
        logger.info('The file has been copied successfully. Response: ', data);
        callback(null, data);
      }
    });
  }
}

module.exports = RecallDataProcessor;
