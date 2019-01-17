const _ = require('lodash');
const ModelDbRecordDto = require('cvr-common/src/dto/modelDbRecord');
const MakeDbRecordDto = require('cvr-common/src/dto/makeDbRecord');

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
   * Iterates over currentRecalls and compares them with previousRecalls
   * uses make_model_recall_number to find corresponding recalls in both maps
   *
   * @returns {RecallDbRecordDto[]} array of objects from currentRecalls
   * which were new or different than their equivalents in previousRecalls
   */
  findModifiedRecalls() {
    const modifiedRecalls = [];
    for (const [key, currentRecall] of this.currentRecalls) {
      const previousRecall = this.previousRecalls.get(key);
      if (RecallComparer.areRecallsDifferent(previousRecall, currentRecall)) {
        modifiedRecalls.push(currentRecall);
      }
    }
    return modifiedRecalls;
  }

  /**
   * Finds objects in currentModels that are not the same as their equivalents in previousModels
   * Equivalent objects are fetched from both maps by the same key
   * @param {Map<ModelDbRecordDto>} previousModels
   * @returns {ModelDbRecordDto[]} New sets of models for records which were updated or added
   */
  findModifiedModels(previousModels) {
    const modifiedModels = [];
    const currentModels = this.constructor.extractModelsFromRecalls(this.currentRecalls);

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
   * @returns {MakeDbRecordDto[]} New sets of makes for records which were updated or added
   */
  findModifiedMakes(previousMakes) {
    const modifiedMakes = [];
    const currentMakes = this.constructor.extractMakesFromRecalls(this.currentRecalls);

    for (const [type, currentMake] of currentMakes) {
      const previousMake = previousMakes.get(type);
      if (RecallComparer.areMakesDifferent(previousMake, currentMake)) {
        modifiedMakes.push(currentMake);
      }
    }
    return modifiedMakes;
  }

  static areObjectsDifferent(previousObject, currentObject, fieldsToCompare) {
    const simplifiedPreviousObject = _.pick(previousObject, fieldsToCompare);
    const simplifiedCurrentObject = _.pick(currentObject, fieldsToCompare);
    const areDifferent = !_.isEqual(simplifiedPreviousObject, simplifiedCurrentObject);
    if (areDifferent) {
      // TODO: BL-9227 execute this block of code only when logging level is set to DEBUG
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
      console.debug(`RecallComparer.areRecallsDifferent() - Detected a new make, model, recall number combination: '${currentRecall.make_model_recall_number}'.`);
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
      console.debug(`RecallComparer.areModelsDifferent() - Detected a new type and make combination: '${currentModel.type_make}'.`);
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
      console.debug(`RecallComparer.areMakesDifferent() - Detected a new type of recall: '${currentMake.type}'.`);
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
    console.debug(diffMessage);
  }

  static sortByStartEnd(ranges) {
    if (Array.isArray(ranges)) {
      return _.sortBy(ranges, ['start', 'end']);
    }
    return ranges;
  }
}

module.exports = RecallComparer;
