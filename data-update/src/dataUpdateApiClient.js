const crypto = require('crypto');
const sequential = require('promise-sequential');
const _ = require('lodash');
const request = require('cvr-common/src/helpers/HttpRequest');
const requestHeaders = require('cvr-common/src/constants/requestHeaders');
const { logger } = require('cvr-common/src/logger/loggerFactory');
const ModelDbRecordDto = require('cvr-common/src/dto/modelDbRecord');
const MakeDbRecordDto = require('cvr-common/src/dto/makeDbRecord');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');
const envVariables = require('./config/environmentVariables');

const RECALLS_BACKEND_URL = envVariables.recallsBackendUrl;
const PAGINATION_ITEMS_COUNT = 250;

class DataUpdateApiClient {
  static getAllModels(callback) {
    const path = `${RECALLS_BACKEND_URL}/models`;
    this.doGet(path, [], {}, (err, body) => {
      if (err) {
        logger.error('DataUpdateApiClient.getAllModels() - Error while calling API: ', err);
        callback(err);
      } else {
        logger.debug(`DataUpdateApiClient.getAllModels() - returning ${body.length} items`);
        callback(null, DataUpdateApiClient.mapModels(body));
      }
    });
  }

  static getAllMakes(callback) {
    const path = `${RECALLS_BACKEND_URL}/makes`;
    this.doGet(path, [], {}, (err, body) => {
      if (err) {
        logger.error('DataUpdateApiClient.getAllMakes() - Error while calling API: ', err);
        callback(err);
      } else {
        logger.debug(`DataUpdateApiClient.getAllMakes() - returning ${body.length} items`);
        callback(null, DataUpdateApiClient.mapMakes(body));
      }
    });
  }

  static getAllRecalls(callback) {
    const path = `${RECALLS_BACKEND_URL}/recalls`;
    this.doGet(path, [], {}, (err, body) => {
      if (err) {
        logger.error('DataUpdateApiClient.getAllRecalls() - Error while calling API: ', err);
        callback(err);
      } else {
        logger.debug(`DataUpdateApiClient.getAllRecalls() - returning ${body.length} items`);
        callback(null, DataUpdateApiClient.mapRecalls(body));
      }
    });
  }

  static updateRecalls(recalls, callback) {
    if (_.isArray(recalls) && recalls.length === 0) {
      logger.info('DataUpdateApiClient.updateRecalls() - payload contains no recalls. Skipping this request.');
      callback();
    } else {
      const path = `${RECALLS_BACKEND_URL}/recalls`;
      sequential(this.getBodiesForPatch(recalls)
        .map(body => this.getPatchPromise(path, body)))
        .then((responses => callback(null, responses)))
        .catch((err) => {
          logger.error('DataUpdateApiClient.updateRecalls() - Error while calling API: ', err);
          callback(err);
        });
    }
  }

  /**
   * @param {MakeDbRecordDto[]} makes
   */
  static updateMakes(makes, callback) {
    if (_.isArray(makes) && makes.length === 0) {
      logger.info('DataUpdateApiClient.updateMakes() - payload contains no makes. Skipping this request.');
      callback();
    } else {
      const path = `${RECALLS_BACKEND_URL}/makes`;
      const serializedMakes = makes.map(make => make.serialize());
      sequential(this.getBodiesForPatch(serializedMakes)
        .map(body => this.getPatchPromise(path, body)))
        .then((responses => callback(null, responses)))
        .catch((err) => {
          logger.error('DataUpdateApiClient.updateMakes() - Error while calling API: ', err);
          callback(err);
        });
    }
  }

  static updateModels(models, callback) {
    if (!models || (_.isArray(models) && models.length === 0)) {
      logger.info('DataUpdateApiClient.updateModels() - payload contains no models. Skipping this request.');
      callback();
    } else {
      const path = `${RECALLS_BACKEND_URL}/models`;
      const serializedModels = models.map(model => model.serialize());

      sequential(this.getBodiesForPatch(serializedModels)
        .map(body => this.getPatchPromise(path, body)))
        .then(responses => callback(null, responses))
        .catch((err) => {
          logger.error('DataUpdateApiClient.updateModels() - Error while calling API: ', err);
          callback(err);
        });
    }
  }

  static deleteRecalls(recalls, callback) {
    const path = `${RECALLS_BACKEND_URL}/recalls`;
    if (_.isArray(recalls) && recalls.length === 0) {
      logger.info('DataUpdateApiClient.deleteRecalls() - payload contains no recall keys. Skipping this request.');
      callback();
    } else {
      request.delete({
        url: path, body: recalls, json: true, headers: DataUpdateApiClient.getRequestHeaders(),
      }, (err, res) => {
        logger.info(`DataUpdateApiClient.deleteRecalls() - Deleting ${recalls.length} recalls. HTTP response code: `, res && res.statusCode);
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
      logger.info('DataUpdateApiClient.deleteMakes() - payload contains no keys. Skipping this request.');
      callback();
    } else {
      request.delete({
        url: path, body: makes, json: true, headers: DataUpdateApiClient.getRequestHeaders(),
      }, (err, res) => {
        logger.info(`DataUpdateApiClient.deleteMakes() - Deleting ${makes.length} makes. HTTP response code `, res && res.statusCode);
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
      logger.info('DataUpdateApiClient.deleteModels() - payload contains no keys. Skipping this request.');
      callback();
    } else {
      request.delete({
        url: path, body: models, json: true, headers: DataUpdateApiClient.getRequestHeaders(),
      }, (err, res) => {
        logger.info(`DataUpdateApiClient.deleteModels() - Deleting ${models.length} models. HTTP response code `, res && res.statusCode);
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
   * for to long body (more than PAGINATION_ITEMS_COUNT) request will be split into few
   * if any error was returned, last one will be called by callback
   *
   * slice not include body[end] element, but body[end - 1]
   */
  static getBodiesForPatch(body) {
    const bodyLength = body.length;
    const bodies = [];
    for (let start = 0; start < bodyLength; start += PAGINATION_ITEMS_COUNT) {
      const end = (start + PAGINATION_ITEMS_COUNT - 1) <= bodyLength
        ? start + PAGINATION_ITEMS_COUNT : bodyLength;
      const serializedBody = body.slice(start, end);
      bodies.push(serializedBody);
      logger.debug(`Calling API for PATCH with [${start}:${end - 1}] of ${bodyLength} items`);
    }
    return bodies;
  }

  static getPatchPromise(path, body) {
    return () => new Promise((resolve, reject) => {
      request.patch({
        url: path,
        body,
        json: true,
        headers: DataUpdateApiClient.getRequestHeaders(),
      }, (err, res) => {
        logger.info(`${path} - HTTP response code ${res && res.statusCode}`);
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  /**
   * when response contains lastEvaluatedKey (more than 1MB response)
   * get will be regenerated with exclusiveStartKey query param (value: lastEvaluatedKey)
   * and response merged
   */
  static doGet(path, resultSet, queryParams, callback) {
    request.get({
      url: path, qs: queryParams, headers: DataUpdateApiClient.getRequestHeaders(),
    }, (err, res, body) => {
      logger.info(`${path} with queryParams: ${JSON.stringify(queryParams)} - HTTP response code ${res && res.statusCode}`);
      if (err) {
        logger.error(path, ' - Error while calling API: ', err);
        callback(err);
      } else {
        const data = JSON.parse(body);
        const set = resultSet.concat(data.items);
        if (data.lastEvaluatedKey) {
          logger.debug(path, ' - lastEvaluatedKey : ', data.lastEvaluatedKey, ' detected, generating additional request');
          this.doGet(
            path,
            set,
            Object.assign({ exclusiveStartKey: data.lastEvaluatedKey }),
            callback,
          );
        } else {
          callback(null, set);
        }
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
    headers[requestHeaders.API_KEY] = envVariables.recallsBackendApiKey;
    logger.debug('Setting request headers:', headers);

    return headers;
  }

  static logErrorMessage(message, apiErr) {
    const statusCode = apiErr && apiErr.statusCode;
    const statusMessage = apiErr && apiErr.statusMessage;
    const body = apiErr && apiErr.body;

    logger.error(`${message} - ${statusCode} ${statusMessage} - ${body}`);
  }
}

module.exports = DataUpdateApiClient;
