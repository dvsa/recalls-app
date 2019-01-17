const request = require('request');
const crypto = require('crypto');
const _ = require('lodash');
const requestHeaders = require('cvr-common/src/constants/requestHeaders');
const ModelDbRecordDto = require('cvr-common/src/dto/modelDbRecord');
const MakeDbRecordDto = require('cvr-common/src/dto/makeDbRecord');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');
const envVariables = require('./config/environmentVariables');

const RECALLS_BACKEND_URL = envVariables.recallsBackendUrl;

class DataUpdateApiClient {
  static getAllModels(callback) {
    const path = `${RECALLS_BACKEND_URL}/models`;
    request.get({ url: path, headers: DataUpdateApiClient.getRequestHeaders() },
      (err, res, body) => {
        console.info('DataUpdateApiClient.getAllModels() - HTTP response code ', res && res.statusCode);

        if (err != null) {
          console.error('DataUpdateApiClient.getAllModels() - Error while calling API: ', err);
          callback(err);
        } else {
          console.debug('DataUpdateApiClient.getAllModels() - returning: ', body);
          callback(null, DataUpdateApiClient.mapModels(JSON.parse(body)));
        }
      });
  }

  static getAllMakes(callback) {
    const path = `${RECALLS_BACKEND_URL}/makes`;
    request.get({ url: path, headers: DataUpdateApiClient.getRequestHeaders() },
      (err, res, body) => {
        console.info('DataUpdateApiClient.getAllMakes() - HTTP response code ', res && res.statusCode);

        if (err != null) {
          console.error('DataUpdateApiClient.getAllMakes() - Error while calling API: ', err);
          callback(err);
        } else {
          console.debug('DataUpdateApiClient.getAllMakes() - returning: ', body);
          callback(null, DataUpdateApiClient.mapMakes(JSON.parse(body)));
        }
      });
  }

  static getAllRecalls(callback) {
    const path = `${RECALLS_BACKEND_URL}/recalls`;
    request.get({ url: path, headers: DataUpdateApiClient.getRequestHeaders() },
      (err, res, body) => {
        console.info('DataUpdateApiClient.getAllRecalls() - HTTP response code ', res && res.statusCode);

        if (err != null) {
          console.error('DataUpdateApiClient.getAllRecalls() - Error while calling API: ', err);
          callback(err);
        } else {
          console.debug('DataUpdateApiClient.getAllRecalls() - returning: ', body);
          callback(null, DataUpdateApiClient.mapRecalls(JSON.parse(body)));
        }
      });
  }

  static updateRecalls(recalls, callback) {
    const path = `${RECALLS_BACKEND_URL}/recalls`;
    if (_.isArray(recalls) && recalls.length === 0) {
      console.info('DataUpdateApiClient.updateRecalls() - payload contains no recalls. Skipping this request.');
      callback();
    } else {
      request.patch({
        url: path, body: recalls, json: true, headers: DataUpdateApiClient.getRequestHeaders(),
      }, (err, res) => {
        console.info('DataUpdateApiClient.updateRecalls() - HTTP response code ', res && res.statusCode);
        if (err != null) {
          console.error('DataUpdateApiClient.updateRecalls() - Error while calling API: ', err);
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
      request.patch({
        url: path, body: serializedMakes, json: true, headers,
      }, (err, res) => {
        console.info('DataUpdateApiClient.updateMakes() - HTTP response code ', res && res.statusCode);
        if (err != null) {
          console.error('DataUpdateApiClient.updateMakes() - Error while calling API: ', err);
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
      request.patch({
        url: path, body: serializedModels, json: true, headers,
      }, (err, res) => {
        console.info('DataUpdateApiClient.updateModels() - HTTP response code ', res && res.statusCode);
        if (err != null) {
          console.error('DataUpdateApiClient.updateModels() - Error while calling API: ', err);
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
        console.info(`DataUpdateApiClient.deleteRecalls() - Deleting ${recalls.length} recalls. HTTP response code `, res && res.statusCode);
        if (err != null) {
          console.error('DataUpdateApiClient.deleteRecalls() - Error while calling API: ', err);
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
          console.error('DataUpdateApiClient.deleteMakes() - Error while calling API: ', err);
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
          console.error('DataUpdateApiClient.deleteModels() - Error while calling API: ', err);
          callback(err);
        } else {
          callback(null, res);
        }
      });
    }
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
}

module.exports = DataUpdateApiClient;
