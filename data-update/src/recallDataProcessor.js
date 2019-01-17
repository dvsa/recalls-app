
const Parser = require('./csvRecallsParser');
const RecallComparer = require('./recallComparer');
const DataUpdateApiClient = require('./dataUpdateApiClient');
const S3BucketObjectProperties = require('./dto/s3BucketObjectProperties');
const envVariables = require('./config/environmentVariables');

class RecallDataProcessor {
  static get bufferError() { return 'Cannot parse data as it is not buffered'; }

  static get noDataError() { return 'Cannot parse empty data'; }

  static download(s3, srcBucket, srcKey, next) {
    // Download the csv file from S3
    console.info('Downloading csv data from S3');
    s3.getObject({
      Bucket: srcBucket,
      Key: srcKey,
    },
    (err, data) => {
      if (err) {
        console.error('Error when dowloading csv file from S3 bucket:', err);
        next(err);
      } else {
        const csvBuffer = data.Body;
        if (csvBuffer == null) {
          console.error('File is empty');
          next(new Error('Downloaded CSV file is empty'));
        } else {
          console.info(`File length: ${data.ContentLength}, last modified: ${data.LastModified}`);
          const s3Properties = new S3BucketObjectProperties(s3, srcBucket, srcKey);
          next(null, s3Properties, csvBuffer);
        }
      }
    });
  }

  static parse(s3Properties, data, next) {
    if (!(data instanceof Buffer)) {
      console.error(RecallDataProcessor.bufferError);
      next(new Error(RecallDataProcessor.bufferError));
    } else if (data.length === 0) {
      console.error(RecallDataProcessor.noDataError);
      next(new Error(RecallDataProcessor.noDataError));
    } else {
      console.info('Parsing the buffered CSV data');
      const parser = new Parser(data, 'CP1252');
      const recalls = parser.parse();

      console.info(`Number of recalls: ${recalls.size}`);

      next(null, s3Properties, recalls);
    }
  }

  static compare(s3Properties, currentRecalls, next) {
    console.info('Comparing parsed CSV data with database contents');

    DataUpdateApiClient.getAllRecalls((recallsErr, previousRecalls) => {
      if (recallsErr) {
        console.warn(`Error while fetching recalls from API: ${JSON.stringify(recallsErr)}`);
        console.info('Unable to find modified recalls due to missing data. Skipping the comparison process');
        next(null, [], [], []);
      } else {
        DataUpdateApiClient.getAllModels((modelsErr, previousModels) => {
          DataUpdateApiClient.getAllMakes((makesErr, previousMakes) => {
            const previousRecallsMap = RecallDataProcessor.mapRecallsByMakeModelRecallNum(
              previousRecalls,
            );
            const comparer = new RecallComparer(previousRecallsMap, currentRecalls);
            const modifiedRecalls = comparer.findModifiedRecalls();

            const modifiedModels = RecallDataProcessor.handleModifiedModels(
              modelsErr, comparer, previousModels,
            );
            const modifiedMakes = RecallDataProcessor.handleModifiedMakes(
              makesErr, comparer, previousMakes,
            );

            next(null, s3Properties, modifiedRecalls, modifiedMakes, modifiedModels);
          });
        });
      }
    });
  }

  static insert(s3Properties, recalls, makes, models, next) {
    console.info(`Number of modified recalls entries: ${recalls.length}`);
    console.info(`Number of modified makes entries: ${makes.length}`);
    console.info(`Number of modified models entries: ${models.length}`);

    DataUpdateApiClient.updateRecalls(recalls, (recallsErr) => {
      DataUpdateApiClient.updateMakes(makes, (makesErr) => {
        DataUpdateApiClient.updateModels(models, (modelsErr) => {
          RecallDataProcessor.handleUpdateError('recalls', recallsErr);
          RecallDataProcessor.handleUpdateError('makes', makesErr);
          RecallDataProcessor.handleUpdateError('models', modelsErr);

          const updateErr = recallsErr || makesErr || modelsErr;
          if (updateErr) {
            next(updateErr);
          } else {
            const destBucket = envVariables.assetsBucketName;
            RecallDataProcessor.copyToBucket(s3Properties, destBucket, `documents/${s3Properties.srcKey}`, (err, data) => {
              if (err) {
                next(err);
              } else {
                next(null, data);
              }
            });
          }
        });
      });
    });
  }

  static handleUpdateError(typeOfData, err) {
    if (err) {
      console.error(`Error while updating ${typeOfData}: ${err}`);
    }
  }

  static handleModifiedModels(modelsErr, comparer, previousModels) {
    if (modelsErr) {
      console.warn(`Error while fetching models from API: ${JSON.stringify(modelsErr)}`);
      console.info('Models will not be updated due to missing data');
      return [];
    }
    const previousModelsMap = RecallDataProcessor.mapModelsByTypeMake(previousModels);
    return comparer.findModifiedModels(previousModelsMap);
  }

  static handleModifiedMakes(makesErr, comparer, previousMakes) {
    if (makesErr) {
      console.warn(`Error while fetching makes from API: ${JSON.stringify(makesErr)}`);
      console.info('Makes will not be updated due to missing data');
      return [];
    }
    const previousMakesMap = RecallDataProcessor.mapMakesByType(previousMakes);
    return comparer.findModifiedMakes(previousMakesMap);
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
    console.info(`Mapped ${mappedRecalls.size} recalls`);
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
    console.info(`Mapped ${mappedModels.size} models`);
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
    console.info(`Mapped ${mappedMakes.size} makes`);
    return mappedMakes;
  }

  static copyToBucket(s3Properties, destBucket, destKey, callback) {
    const params = {
      Bucket: destBucket,
      CopySource: `${s3Properties.srcBucket}/${s3Properties.srcKey}`,
      Key: destKey,
    };
    s3Properties.s3.copyObject(params, (err, data) => {
      console.debug('Copying CSV file to assets bucket. Params: ', params);
      if (err) {
        console.error('Error while copying CSV file to assets bucket', err);
        callback(err);
      } else {
        console.info('The file has been copied successfully. Response: ', data);
        callback(null, data);
      }
    });
  }
}

module.exports = RecallDataProcessor;
