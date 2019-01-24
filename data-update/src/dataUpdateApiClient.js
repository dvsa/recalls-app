const request = require('request');
const crypto = require('crypto');
const _ = require('lodash');
const requestHeaders = require('cvr-common/src/constants/requestHeaders');
const ModelDbRecordDto = require('cvr-common/src/dto/modelDbRecord');
const MakeDbRecordDto = require('cvr-common/src/dto/makeDbRecord');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');
const envVariables = require('./config/environmentVariables');

const RECALLS_BACKEND_URL = envVariables.recallsBackendUrl;
const PAGINATION_ITEMS_COUNT = 500;

class DataUpdateApiClient {
  static getAllModels(callback) {
    const path = `${RECALLS_BACKEND_URL}/models`;
    const queryParams = {};
    const headers = DataUpdateApiClient.getRequestHeaders();
    const resultSet = [];
    this.doGet(path, headers, resultSet, queryParams, (err, body) => {
      if (err) {
        console.error('DataUpdateApiClient.getAllModels() - Error while calling API: ', err);
        callback(err);
      } else {
        console.debug(`DataUpdateApiClient.getAllModels() - returning ${body.length} items`);
        callback(null, DataUpdateApiClient.mapModels(body));
      }
    });
  }

  static getAllMakes(callback) {
    const path = `${RECALLS_BACKEND_URL}/makes`;
    const queryParams = {};
    const headers = DataUpdateApiClient.getRequestHeaders();
    const resultSet = [];
    this.doGet(path, headers, resultSet, queryParams, (err, body) => {
      if (err) {
        console.error('DataUpdateApiClient.getAllMakes() - Error while calling API: ', err);
        callback(err);
      } else {
        console.debug(`DataUpdateApiClient.getAllMakes() - returning ${body.length} items`);
        callback(null, DataUpdateApiClient.mapMakes(body));
      }
    });
  }

  static getAllRecalls(callback) {
    const path = `${RECALLS_BACKEND_URL}/recalls`;
    const queryParams = {};
    const headers = DataUpdateApiClient.getRequestHeaders();
    const resultSet = [];
    this.doGet(path, headers, resultSet, queryParams, (err, body) => {
      if (err) {
        console.error('DataUpdateApiClient.getAllRecalls() - Error while calling API: ', err);
        callback(err);
      } else {
        console.debug(`DataUpdateApiClient.getAllRecalls() - returning ${body.length} items`);
        callback(null, DataUpdateApiClient.mapRecalls(body));
      }
    });
  }

  static updateRecalls(recalls, callback) {
    const path = `${RECALLS_BACKEND_URL}/recalls`;
    const headers = DataUpdateApiClient.getRequestHeaders();
    if (_.isArray(recalls) && recalls.length === 0) {
      console.info('DataUpdateApiClient.updateRecalls() - payload contains no recalls. Skipping this request.');
      callback();
    } else {
      this.patchWithPagination(path, recalls, headers, (err, res) => {
        console.info('DataUpdateApiClient.updateRecalls() - HTTP response code ', res && res.statusCode);
        if (err != null) {
          DataUpdateApiClient.logErrorMessage('DataUpdateApiClient.updateRecalls() - Error while calling API: ', err);
          callback(err);
        } else {
          callback(null, res);
        }
      });
    }
  }

  /**
   * @param {MakeDbRecordDto[]} makes
   */
  static updateMakes(makes, callback) {
    const path = `${RECALLS_BACKEND_URL}/makes`;
    const serializedMakes = makes.map(make => make.serialize());
    const headers = DataUpdateApiClient.getRequestHeaders();

    if (_.isArray(makes) && makes.length === 0) {
      console.info('DataUpdateApiClient.updateMakes() - payload contains no makes. Skipping this request.');
      callback();
    } else {
      this.patchWithPagination(path, serializedMakes, headers, (err, res) => {
        console.info('DataUpdateApiClient.updateMakes() - HTTP response code ', res && res.statusCode);
        if (err != null) {
          DataUpdateApiClient.logErrorMessage('DataUpdateApiClient.updateMakes() - Error while calling API: ', err);
          callback(err);
        } else {
          callback(null, res);
        }
      });
    }
  }

  static updateModels(models, callback) {
    const path = `${RECALLS_BACKEND_URL}/models`;
    const serializedModels = models.map(model => model.serialize());
    const headers = DataUpdateApiClient.getRequestHeaders();

    if (_.isArray(models) && models.length === 0) {
      console.info('DataUpdateApiClient.updateModels() - payload contains no models. Skipping this request.');
      callback();
    } else {
      this.patchWithPagination(path, serializedModels, headers, (err, res) => {
        console.info('DataUpdateApiClient.updateModels() - HTTP response code ', res && res.statusCode);
        if (err != null) {
          DataUpdateApiClient.logErrorMessage('DataUpdateApiClient.updateModels() - Error while calling API: ', err);
          callback(err);
        } else {
          callback(null, res);
        }
      });
    }
  }

  static deleteRecalls(recalls, callback) {
    const path = `${RECALLS_BACKEND_URL}/recalls`;
    if (_.isArray(recalls) && recalls.length === 0) {
      console.info('DataUpdateApiClient.deleteRecalls() - payload contains no recall keys. Skipping this request.');
      callback();
    } else {
      request.delete({
        url: path, body: recalls, json: true, headers: DataUpdateApiClient.getRequestHeaders(),
      }, (err, res) => {
        console.info(`DataUpdateApiClient.deleteRecalls() - Deleting ${recalls.length} recalls. HTTP response code: `, res && res.statusCode);
        if (err != null) {
          DataUpdateApiClient.logErrorMessage('DataUpdateApiClient.deleteRecalls() - Error while calling API: ', err);
          callback(err);
        } else {
          callback(null, res);
        }
      });
    }
  }

  static deleteMakes(makes, callback) {
    const path = `${RECALLS_BACKEND_URL}/makes`;
    if (_.isArray(makes) && makes.length === 0) {
      console.info('DataUpdateApiClient.deleteMakes() - payload contains no keys. Skipping this request.');
      callback();
    } else {
      request.delete({
        url: path, body: makes, json: true, headers: DataUpdateApiClient.getRequestHeaders(),
      }, (err, res) => {
        console.info(`DataUpdateApiClient.deleteMakes() - Deleting ${makes.length} makes. HTTP response code `, res && res.statusCode);
        if (err != null) {
          DataUpdateApiClient.logErrorMessage('DataUpdateApiClient.deleteMakes() - Error while calling API: ', err);
          callback(err);
        } else {
          callback(null, res);
        }
      });
    }
  }

  static deleteModels(models, callback) {
    const path = `${RECALLS_BACKEND_URL}/models`;
    if (_.isArray(models) && models.length === 0) {
      console.info('DataUpdateApiClient.deleteModels() - payload contains no keys. Skipping this request.');
      callback();
    } else {
      request.delete({
        url: path, body: models, json: true, headers: DataUpdateApiClient.getRequestHeaders(),
      }, (err, res) => {
        console.info(`DataUpdateApiClient.deleteModels() - Deleting ${models.length} models. HTTP response code `, res && res.statusCode);
        if (err != null) {
          DataUpdateApiClient.logErrorMessage('DataUpdateApiClient.deleteModels() - Error while calling API: ', err);
          callback(err);
        } else {
          callback(null, res);
        }
      });
    }
  }

  /**
   * for to long body (more than PAGINATION_ITEMS_COUNT) request will be splitted into few
   */
  static patchWithPagination(path, body, headers, callback) {
    const bodyLength = body.length;
    for (let start = 0; start < bodyLength; start += PAGINATION_ITEMS_COUNT) {
      const end = start + PAGINATION_ITEMS_COUNT <= bodyLength
        ? start + PAGINATION_ITEMS_COUNT - 1 : bodyLength - 1;
      const serializedBody = body.slice(start, end);
      console.debug(`Calling API for ${path} - [${start}:${end}] of ${bodyLength} items`);
      this.doPatch(path, serializedBody, headers, callback);
    }
  }

  static doPatch(path, body, headers, callback) {
    request.patch({
      url: path,
      body,
      json: true,
      headers,
    }, (err, res) => {
      console.info(`${path} - HTTP response code ${res && res.statusCode}`);
      if (err) {
        console.error(path, ' - Error while calling API: ', err);
        callback(err);
      } else {
        callback(null, res);
      }
    });
  }

  /**
   * when response contains lastEvaluatedKey (more than 1MB response)
   * get will be regenerated with exclusiveStartKey query param (value: lastEvaluatedKey)
   * and response merged
   */
  static doGet(path, headers, resultSet = [], queryParams = {}, callback) {
    request.get({
      url: path, qs: queryParams, headers,
    }, (err, res, body) => {
      console.info('body : ', body);
      console.info(`${path} with queryParams: ${JSON.stringify(queryParams)} - HTTP response code ${res && res.statusCode}`);
      if (err) {
        console.error(path, ' - Error while calling API: ', err);
        callback(err);
      } else {
        console.debug(path, ' - returning: ', body);
        const data = JSON.parse(body);
        const set = resultSet.concat(data.items);
        if (data.lastEvaluatedKey) {
          console.debug(path, ' - lastEvaluatedKey detected, generating additional request');
          const queryStrings = Object.assign({ exclusiveStartKey: data.lastEvaluatedKey },
            queryParams);
          this.doGet(path, headers, set, queryStrings, callback);
        }
        callback(null, set);
      }
    });
  }

  /**
   * @param {Object[]} models
   * @returns {ModelDbRecordDto[]}
   */
  static mapModels(models) {
    return models.map(model => new ModelDbRecordDto(
      model.type_make,
      new Set(model.models),
    ));
  }

  /**
   * @param {Object[]} makes
   * @returns {MakeDbRecordDto[]}
   */
  static mapMakes(makes) {
    return makes.map(make => new MakeDbRecordDto(
      make.type,
      new Set(make.makes),
    ));
  }

  static mapRecalls(recalls) {
    return recalls.map(RecallDbRecordDto.mapFromObject);
  }

  static getRequestHeaders() {
    const headers = {};
    headers[requestHeaders.PARENT_REQUEST_ID] = crypto.randomBytes(20).toString('hex');
    headers[requestHeaders.CALLER_NAME] = envVariables.lambdaName;
    console.debug('Setting request headers:', headers);

    return headers;
  }

  static logErrorMessage(message, apiErr) {
    const statusCode = apiErr && apiErr.statusCode;
    const statusMessage = apiErr && apiErr.statusMessage;
    const body = apiErr && apiErr.body;

    console.error(`${message} - ${statusCode} ${statusMessage} - ${body}`);
  }
}

module.exports = DataUpdateApiClient;
