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
   * @returns {string[]} primary keys of recalls that should be deleted
   */
  findDeletedRecallsPrimaryKeys() {
    return RecallComparer.findDeletedKeys(this.previousRecalls, this.currentRecalls, 'make_model_recall_number');
  }

  /**
   * @param {Map<String, MakeDbRecordDto>} previousMakes outdated makes from DB
   * @param {Map<String, MakeDbRecordDto>} currentMakes current makes from CSV
   * @returns {string[]} primary keys of makes that should be deleted
   */
  static findDeletedMakesPrimaryKeys(previousMakes, currentMakes) {
    return RecallComparer.findDeletedKeys(previousMakes, currentMakes, 'type');
  }

  /**
   * @param {Map<String, ModelDbRecordDto>} previousModels outdated models from DB
   * @param {Map<String, ModelDbRecordDto>} currentModels current models from CSV
   * @returns {string[]} primary keys of models that should be deleted
   */
  static findDeletedModelsPrimaryKeys(previousModels, currentModels) {
    return RecallComparer.findDeletedKeys(previousModels, currentModels, 'type_make');
  }

  /**
   * @param {Map} previousMap previous objects containing primary keys as one of their properties
   * @param {Map} currentMap current objects containing primary keys as one of their properties
   * @param {string} keyName name of a property that stores the primary key
   * @returns {string[]} primary keys of records that should be deleted
   */
  static findDeletedKeys(previousMap, currentMap, keyName) {
    const deletedKeys = [];
    for (const [key, previousEntry] of previousMap) {
      if (!currentMap.has(key)) {
        logger.debug(`The following key is no longer present in the current dataset and will be deleted: ${keyName} = ${key}`);
        deletedKeys.push(previousEntry[keyName]);
      }
    }
    return deletedKeys;
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
   * @param {Map<RecallDbRecordDto>} recalls
   * @returns {Map<ModelDbRecordDto>} sets of models grouped by type-make keys
   */
  static extractModelsFromRecalls(recalls) {
    const models = new Map();

    for (const recall of recalls.values()) {
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
   * @param {Map<RecallDbRecordDto>} recalls
   * @returns {Map<MakeDbRecordDto>} sets of makes grouped by type-make keys
   */
  static extractMakesFromRecalls(recalls) {
    const makes = new Map();

    for (const recall of recalls.values()) {
      const typeKey = recall.type;
      if (makes.has(typeKey)) {
        makes.get(typeKey).makes.add(recall.make);
      } else {
        makes.set(typeKey, new MakeDbRecordDto(typeKey, new Set([recall.make])));
      }
    }

    return makes;
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
