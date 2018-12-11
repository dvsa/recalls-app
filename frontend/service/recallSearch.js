const request = require('request');
const RecallDto = require('cvr-common/dto/recall');
const logger = require('cvr-common/logger/loggerFactory').create();
const envVariables = require('../config/environmentVariables');

const RECALLS_BACKEND_URL = envVariables.recallsBackendUrl;

class RecallSearch {
  static fetchAllMakes(type, callback) {
    const path = `${RECALLS_BACKEND_URL}/recall-type/${type}/make`;
    request.get(path, (err, res, body) => {
      logger.info(`RecallSearch.fetchAllMakes(${type}) - HTTP response code: `, res && res.statusCode);

      if (err != null) {
        logger.error('RecallSearch.fetchAllMakes() - Error while calling API: ', err);
        callback(err);
      } else {
        logger.debug('RecallSearch.fetchAllMakes() - returning: ', body);
        callback(null, JSON.parse(body));
      }
    });
  }

  static fetchAllModels(type, make, callback) {
    const encodedMake = encodeURIComponent(make);
    const path = `${RECALLS_BACKEND_URL}/recall-type/${type}/make/${encodedMake}/model`;
    request.get(path, (err, res, body) => {
      logger.info(`RecallSearch.fetchAllModels(${type}, ${make}) - HTTP response code `, res && res.statusCode);

      if (err != null) {
        logger.error('RecallSearch.fetchAllModels() - Error while calling API: ', err);
        callback(err);
      } else {
        logger.debug('RecallSearch.fetchAllModels() - returning: ', body);
        callback(null, JSON.parse(body));
      }
    });
  }

  static byMakeAndModel(type, make, model, callback) {
    const encodedMake = encodeURIComponent(make);
    const encodedModel = encodeURIComponent(model);
    const path = `${RECALLS_BACKEND_URL}/recall-type/${type}/make/${encodedMake}/model/${encodedModel}/recalls`;
    this.fetchRecalls(path, type, make, model, null, callback);
  }

  static byMakeModelAndYear(type, make, model, year, callback) {
    const encodedMake = encodeURIComponent(make);
    const encodedModel = encodeURIComponent(model);
    const path = `${RECALLS_BACKEND_URL}/recall-type/${type}/make/${encodedMake}/model/${encodedModel}/year/${year}/recalls`;
    this.fetchRecalls(path, type, make, model, year, callback);
  }

  static fetchRecalls(path, type, make, model, year, callback) {
    request.get(encodeURI(path), (err, res, body) => {
      logger.info(`RecallSearch for (${type}, ${make}, ${model}, ${year}) - HTTP response code`, res && res.statusCode);

      if (err != null) {
        logger.error('RecallSearch.fetchRecalls() - Error while calling API: ', err);
        callback(err);
      } else {
        logger.debug('RecallSearch.fetchRecalls() - returning: ', body);
        const recalls = this.mapRecallsToDto(body);
        callback(null, recalls);
      }
    });
  }

  static mapRecallsToDto(body) {
    logger.debug('Entering RecallSearch.mapRecallsToDto()');
    const parsedRecalls = JSON.parse(body);
    return parsedRecalls.map((recall) => {
      const recallDto = new RecallDto();
      recallDto.make = recall.make;
      recallDto.model = recall.model;
      recallDto.recallNumber = recall.recallNumber;
      recallDto.defectDescription = recall.defectDescription;
      recallDto.launchDate = recall.launchDate;
      recallDto.concern = recall.concern;
      recallDto.remedy = recall.remedy;
      recallDto.affectedVehiclesNumber = recall.affectedVehiclesNumber;
      recallDto.buildStart = recall.buildStart;
      recallDto.buildEnd = recall.buildEnd;
      return recallDto;
    });
  }
}

module.exports = RecallSearch;
