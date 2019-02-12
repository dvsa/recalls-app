const _ = require('lodash');
const { logger } = require('cvr-common/src/logger/loggerFactory');
const ModelDbRecordDto = require('cvr-common/src/dto/modelDbRecord');
const MakeDbRecordDto = require('cvr-common/src/dto/makeDbRecord');
const envVariables = require('./config/environmentVariables');

const RECALL_FIELDS_TO_COMPARE = [
  'make_model_recall_number',
  'type',
  'type_make_model',
  'launch_date',
  'recall_number',
  'make',
  'concern',
  'defect',
  'remedy',
  'vehicle_number',
  'model',
  'vin_range',
  'build_range',
];

const MODEL_FIELDS_TO_COMPARE = ['type_make', 'models'];
const MAKE_FIELDS_TO_COMPARE = ['type', 'makes'];

class RecallComparer {
  /**
   * @param {Map<String, RecallDbRecordDto>} previousRecalls
   * map keys should consist of make_model_recall_number
   * @param {Map<String, RecallDbRecordDto>} currentRecalls
   * map keys should consist of make_model_recall_number
   */
  constructor(previousRecalls, currentRecalls) {
    this.previousRecalls = previousRecalls;
    this.currentRecalls = currentRecalls;
  }

  /**
   * @param {RecallDbRecordDto[]} recallsWithMissingModel
   * @returns {string[]} primary keys of recalls that should be deleted
   */
  findDeletedRecallsPrimaryKeys(recallsWithMissingModel) {
    return RecallComparer.findDeletedKeys(this.previousRecalls, this.currentRecalls, recallsWithMissingModel, 'make_model_recall_number');
  }

  /**
   * @param {Map<String, MakeDbRecordDto>} previousMakes outdated makes from DB
   * @param {Map<String, MakeDbRecordDto>} currentMakes current makes from CSV
   * @param {RecallDbRecordDto[]} recallsWithMissingModel current recalls with missing models
   * @returns {string[]} primary keys of makes that should be deleted
   */
  static findDeletedMakesPrimaryKeys(previousMakes, currentMakes, recallsWithMissingModel) {
    return RecallComparer.findDeletedKeys(previousMakes, currentMakes, recallsWithMissingModel, 'type');
  }

  /**
   * @param {Map<String, ModelDbRecordDto>} previousModels outdated models from DB
   * @param {Map<String, ModelDbRecordDto>} currentModels current models from CSV
   * @param {RecallDbRecordDto[]} recallsWithMissingModel current recalls with missing models
   * @returns {string[]} primary keys of models that should be deleted
   */
  static findDeletedModelsPrimaryKeys(previousModels, currentModels, recallsWithMissingModel) {
    return RecallComparer.findDeletedKeys(previousModels, currentModels, recallsWithMissingModel, 'type_make');
  }

  /**
   * @param {Map} previousMap previous objects containing primary keys as one of their properties
   * @param {Map} currentMap current objects containing primary keys as one of their properties
   * @param {RecallDbRecordDto[]} recallsWithMissingModel array of recalls without models
   * @param {string} keyName name of a property that stores the primary key
   * @returns {string[]} primary keys of records that should be deleted
   */
  static findDeletedKeys(previousMap, currentMap, recallsWithMissingModel, keyName) {
    const deletedKeys = [];
    for (const [key, previousEntry] of previousMap) {
      if (!currentMap.has(key)) {
        if (RecallComparer.isKeyOnTheList(keyName, key, previousEntry, recallsWithMissingModel)) {
          logger.debug(`The following key is no longer present in the current dataset but has missing model, so won't be deleted: ${keyName} = ${key}`);
        } else {
          logger.debug(`The following key is no longer present in the current dataset and will be deleted: ${keyName} = ${key}`);
          deletedKeys.push(previousEntry[keyName]);
        }
      }
    }
    return deletedKeys;
  }

  /**
   * Checks if the key (recall, make or model) appears on the list of recalls without model.
   * If it does, it won't be marked to be deleted.
   *
   * @param {string} keyName name of a property that stores the primary key
   * @param {string} previousKey key of entry from the database
   * @param {object} previousEntry entry from the database
   * @param {RecallDbRecordDto[]} recallsWithMissingModel array of recalls without models
   */
  static isKeyOnTheList(keyName, previousKey, previousEntry, recallsWithMissingModel) {
    let isOnList = false;
    recallsWithMissingModel.forEach((recall) => {
      if (keyName === 'make_model_recall_number' && recall.make === previousEntry.make
      && recall.recall_number === previousEntry.recall_number) {
        isOnList = true;
      } else if (keyName === 'type' && recall.type === previousEntry.type) {
        isOnList = true;
      } else if (keyName === 'type_make' && `${recall.type}-${recall.make}` === previousKey) {
        isOnList = true;
      }
    });

    return isOnList;
  }

  /**
   * Iterates over currentRecalls, validates them and compares with previousRecalls
   * Uses make_model_recall_number to find corresponding recalls in both maps
   *
   * @returns {RecallDbRecordDto[]} array of objects from currentRecalls
   * which were new or different than their equivalents in previousRecalls
   */
  findModifiedAndValidRecalls() {
    const modifiedRecalls = [];
    for (const [key, currentRecall] of this.currentRecalls) {
      const previousRecall = this.previousRecalls.get(key);
      if (currentRecall.isValid()) {
        if (RecallComparer.areRecallsDifferent(previousRecall, currentRecall)) {
          modifiedRecalls.push(currentRecall);
        }
      } else {
        this.constructor.handleInvalidRecall(key, previousRecall, this.currentRecalls);
      }
    }
    return modifiedRecalls;
  }

  /**
   * Finds objects in currentModels that are not the same as their equivalents in previousModels
   * Equivalent objects are fetched from both maps by the same key
   * @param {Map<ModelDbRecordDto>} previousModels
   * @param {Map<ModelDbRecordDto>} currentModels
   * @returns {ModelDbRecordDto[]} New sets of models for records which were updated or added
   */
  static findModifiedModels(previousModels, currentModels) {
    const modifiedModels = [];

    for (const [typeAndMake, currentModel] of currentModels) {
      const previousModel = previousModels.get(typeAndMake);

      if (RecallComparer.areModelsDifferent(previousModel, currentModel)) {
        modifiedModels.push(currentModel);
      }
    }
    return modifiedModels;
  }

  /**
   * Finds objects in currentMakes that are not the same as their equivalents in previousMakes
   * Equivalent objects are fetched from both maps by the same key
   * @param {Map<MakeDbRecordDto>} previousMakes
   * @param {Map<MakeDbRecordDto>} currentMakes
   * @returns {MakeDbRecordDto[]} New sets of makes for records which were updated or added
   */
  static findModifiedMakes(previousMakes, currentMakes) {
    const modifiedMakes = [];

    for (const [type, currentMake] of currentMakes) {
      const previousMake = previousMakes.get(type);

      if (RecallComparer.areMakesDifferent(previousMake, currentMake)) {
        modifiedMakes.push(currentMake);
      }
    }
    return modifiedMakes;
  }

  /**
   * Removes invalid recall from currentRecalls list, or replaces it with previous version,
   * because we don't update the db with invalid recalls.
   *
   * If the recall has previous version, method restores the recall to that version
   * to avoid deleting that recall (if the recall is not present on the currentRecalls list
   * but is in the db, it'll be marked for the deletion).
   * If the previous version doesn't exist (and that means it's a new recall),
   * removes recall from the currentRecalls list (it's inccorect so we won't add it to the db).
   *
   * @param {string} key
   * @param {Map<String, RecallDbRecordDto>} previousVersion
   * @param {Map<RecallDbRecordDto>} currentRecalls
   */
  static handleInvalidRecall(key, previousVersion, currentRecalls) {
    logger.warn(`Invalid recall with key ${key}`);
    if (previousVersion != null) {
      logger.info('Replacing invalid recall with previous version');
      currentRecalls.set(key, previousVersion);
    } else {
      logger.info('No previous version present, removing invalid recall');
      currentRecalls.delete(key);
    }
  }

  static areObjectsDifferent(previousObject, currentObject, fieldsToCompare) {
    const simplifiedPreviousObject = _.pick(previousObject, fieldsToCompare);
    const simplifiedCurrentObject = _.pick(currentObject, fieldsToCompare);
    const areDifferent = !_.isEqual(simplifiedPreviousObject, simplifiedCurrentObject);
    if (areDifferent && envVariables.logLevel === 'debug') {
      RecallComparer.displayObjectDiff(simplifiedPreviousObject, simplifiedCurrentObject);
    }
    return areDifferent;
  }

  /**
   * @param {RecallDbRecordDto} previousRecall
   * @param {RecallDbRecordDto} currentRecall
   * @returns {boolean}
   */
  static areRecallsDifferent(previousRecall, currentRecall) {
    if (previousRecall == null && currentRecall) {
      logger.debug(`RecallComparer.areRecallsDifferent() - Detected a new make, model, recall number combination: '${currentRecall.make_model_recall_number}'.`);
      return true;
    }
    const sortedPreviousRecall = previousRecall;
    const sortedCurrentRecall = currentRecall;
    sortedPreviousRecall.vin_range = this.sortByStartEnd(previousRecall.vin_range);
    sortedCurrentRecall.vin_range = this.sortByStartEnd(currentRecall.vin_range);
    sortedPreviousRecall.build_range = this.sortByStartEnd(previousRecall.build_range);
    sortedCurrentRecall.build_range = this.sortByStartEnd(currentRecall.build_range);

    return RecallComparer.areObjectsDifferent(
      sortedPreviousRecall, sortedCurrentRecall, RECALL_FIELDS_TO_COMPARE,
    );
  }

  /**
   * @param {ModelDbRecordDto} previousModel
   * @param {ModelDbRecordDto} currentModel
   * @returns {boolean}
   */
  static areModelsDifferent(previousModel, currentModel) {
    if (previousModel == null && currentModel) {
      logger.debug(`RecallComparer.areModelsDifferent() - Detected a new type and make combination: '${currentModel.type_make}'.`);
      return true;
    }

    return RecallComparer.areObjectsDifferent(
      previousModel.serialize(), currentModel.serialize(), MODEL_FIELDS_TO_COMPARE,
    );
  }

  /**
   * @param {MakeDbRecordDto} previousMake
   * @param {MakeDbRecordDto} currentMake
   * @returns {boolean}
   */
  static areMakesDifferent(previousMake, currentMake) {
    if (previousMake == null && currentMake) {
      logger.debug(`RecallComparer.areMakesDifferent() - Detected a new type of recall: '${currentMake.type}'.`);
      return true;
    }
    return RecallComparer.areObjectsDifferent(
      previousMake.serialize(), currentMake.serialize(), MAKE_FIELDS_TO_COMPARE,
    );
  }

  /**
   * @param {Map<String, RecallDbRecordDto>} recalls
   * @param {Map<String, RecallDbRecordDto>} previousRecallsMap
   * @param {RecallDbRecordDto[]} recallsWithMissingModel
   * @returns {Map<ModelDbRecordDto>} sets of models grouped by type-make keys
   */
  static extractModelsFromRecalls(recalls, previousRecallsMap, recallsWithMissingModel) {
    const models = new Map();
    const recallsWithModel = RecallComparer.addModelsToRecallsWithoutModels(
      recallsWithMissingModel, previousRecallsMap,
    );
    const allRecalls = Array.from(recalls.values()).concat(recallsWithModel);

    for (const recall of allRecalls) {
      const typeMakeKey = `${recall.type}-${recall.make}`;
      if (models.has(typeMakeKey)) {
        models.get(typeMakeKey).models.add(recall.model);
      } else {
        models.set(typeMakeKey, new ModelDbRecordDto(typeMakeKey, new Set([recall.model])));
      }
    }

    return models;
  }

  /**
   * For each recall that has missing model
   * fetches recalls from the database based on recall number and make
   * and adds them to the recall.
   *
   * @param {RecallDbRecordDto[]} recallsWithMissingModel
   * @param {Map<String, RecallDbRecordDto>} previousRecallsMap
   * @returns {RecallDbRecordDto []} array of recalls with models completed
   */
  static addModelsToRecallsWithoutModels(recallsWithMissingModel, previousRecallsMap) {
    const recallsWithModel = [];
    for (const recall of recallsWithMissingModel) {
      for (const prevRecall of previousRecallsMap.values()) {
        if (recall.recall_number === prevRecall.recall_number
          && recall.make === prevRecall.make) {
          recallsWithModel.push(prevRecall);
        }
      }
    }
    return recallsWithModel;
  }

  /**
   * @param {Map<RecallDbRecordDto>} recalls
   * @param {Map<String, RecallDbRecordDto>} previousRecallsMap
   * @param {RecallDbRecordDto[]} recallsWithMissingModel
   * @returns {Map<MakeDbRecordDto>} sets of makes grouped by type-make keys
   */
  static extractMakesFromRecalls(recalls, previousRecallsMap, recallsWithMissingModel) {
    const makes = new Map();
    const recallsWithMissingModelAlreadyExisting = RecallComparer.extractMakesFromPreviousRecalls(
      previousRecallsMap, recallsWithMissingModel,
    );
    const allRecalls = Array.from(recalls.values()).concat(recallsWithMissingModelAlreadyExisting);

    for (const recall of allRecalls) {
      const typeKey = recall.type;
      if (makes.has(typeKey)) {
        makes.get(typeKey).makes.add(recall.make);
      } else {
        makes.set(typeKey, new MakeDbRecordDto(typeKey, new Set([recall.make])));
      }
    }

    return makes;
  }

  /**
   * For each recall that has missing model checks if we have it in our database,
   * and if we do, adds it to the array of recalls without models we should retrieve makes from.
   *
   * @param {RecallDbRecordDto[]} recallsWithMissingModel
   * @param {Map<String, RecallDbRecordDto>} previousRecallsMap
   * @returns {RecallDbRecordDto []} array of recalls without models
   */
  static extractMakesFromPreviousRecalls(previousRecallsMap, recallsWithMissingModel) {
    const recallsWithMissingModelAlreadyExisting = [];
    for (const recall of recallsWithMissingModel) {
      const found = _.find(Array.from(previousRecallsMap.values()),
        prevRecall => prevRecall.recall_number === recall.recall_number
        && prevRecall.make === recall.make);

      if (found !== undefined) {
        recallsWithMissingModelAlreadyExisting.push(recall);
      }
    }

    return recallsWithMissingModelAlreadyExisting;
  }

  static displayObjectDiff(firstObject, secondObject) {
    let diffMessage = '======= Diff beginning =======================\r';
    _.mergeWith(firstObject, secondObject, (objectValue, sourceValue, key) => {
      if (!(_.isEqual(objectValue, sourceValue)) && (Object(objectValue) !== objectValue)) {
        diffMessage += `Key: ${key}\r    Expected: ${JSON.stringify(sourceValue)}\r    Actual:  ${JSON.stringify(objectValue)}\r`;
      }
    });
    diffMessage += '--- Compared objects details: -----------------\r';
    diffMessage += '--- First object: -----------------------------\r';
    diffMessage += `${JSON.stringify(firstObject)}\r`;
    diffMessage += '--- Second object: ----------------------------\r';
    diffMessage += `${JSON.stringify(secondObject)}\r`;
    diffMessage += '======= Diff ending =============================';
    logger.debug(diffMessage);
  }

  static sortByStartEnd(ranges) {
    if (Array.isArray(ranges)) {
      return _.sortBy(ranges, ['start', 'end']);
    }
    return ranges;
  }
}

module.exports = RecallComparer;
