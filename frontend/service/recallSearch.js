const httpContext = require('express-http-context');
const request = require('cvr-common/src/helpers/HttpRequest');
const sessionStorageConstants = require('cvr-common/src/constants/sessionStorageKeys');
const requestHeaders = require('cvr-common/src/constants/requestHeaders');
const RecallDto = require('cvr-common/src/dto/recall');
const DateParser = require('cvr-common/src/helpers/DateParser');
const { logger } = require('cvr-common/src/logger/loggerFactory');
const envVariables = require('../config/environmentVariables');

const RECALLS_BACKEND_URL = envVariables.recallsBackendUrl;
const LAUNCH_DATE_FORMAT = 'DD-MM-YYYY';

class RecallSearch {
  static fetchAllMakes(type, callback) {
    const path = `${RECALLS_BACKEND_URL}/recall-type/${type}/make`;
    request.get({ url: path, headers: this.getRequestHeaders() }, (err, res, body) => {
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
    request.get({ url: path, headers: this.getRequestHeaders() }, (err, res, body) => {
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
    request.get({ url: encodeURI(path), headers: this.getRequestHeaders() }, (err, res, body) => {
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
    return parsedRecalls.map(recall => new RecallDto(
      recall.make,
      recall.model,
      recall.recallNumber,
      recall.defectDescription,
      DateParser.parseDateToFormat(recall.launchDate, LAUNCH_DATE_FORMAT),
      recall.concern,
      recall.remedy,
      recall.affectedVehiclesNumber,
      recall.buildRange,
    ));
  }

  static getRequestHeaders() {
    const headers = {};
    headers[requestHeaders.PARENT_REQUEST_ID] = httpContext.get(
      sessionStorageConstants.REQUEST_ID_KEY,
    );
    headers[requestHeaders.CALLER_NAME] = httpContext.get(
      sessionStorageConstants.FUNCTION_NAME,
    );
    headers[requestHeaders.API_KEY] = envVariables.recallsBackendApiKey;
    logger.debug('Setting request headers:', headers);

    return headers;
  }
}

module.exports = RecallSearch;
