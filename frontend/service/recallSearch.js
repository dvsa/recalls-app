const request = require('request');
const RecallDto = require('cvr-common/dto/recall');
const envVariables = require('../config/environmentVariables');

const RECALLS_BACKEND_URL = envVariables.recallsBackendUrl;

class RecallSearch {
  static fetchAllMakes(type, callback) {
    const path = `${RECALLS_BACKEND_URL}/recall-types/${type}/makes`;
    request.get(path, (err, res, body) => {
      console.info(`RecallSearch.fetchAllMakes(${type}) - HTTP response code: `, res && res.statusCode);

      if (err != null) {
        console.error('RecallSearch.fetchAllMakes() - Error while calling API: ', err);
        callback(err);
      } else {
        callback(null, JSON.parse(body));
      }
    });
  }

  static fetchAllModels(type, make, callback) {
    const encodedMake = encodeURIComponent(make);
    const path = `${RECALLS_BACKEND_URL}/recall-types/${type}/makes/${encodedMake}/models`;
    request.get(path, (err, res, body) => {
      console.info(`RecallSearch.fetchAllModels(${type}, ${make}) - HTTP response code `, res && res.statusCode);

      if (err != null) {
        console.error('RecallSearch.fetchAllModels() - Error while calling API: ', err);
        callback(err);
      } else {
        callback(null, JSON.parse(body));
      }
    });
  }

  static byMakeAndModel(type, make, model, callback) {
    const encodedMake = encodeURIComponent(make);
    const encodedModel = encodeURIComponent(model);
    const path = `${RECALLS_BACKEND_URL}/recall-types/${type}/makes/${encodedMake}/models/${encodedModel}/recalls`;
    request.get(encodeURI(path), (err, res, body) => {
      console.info(`RecallSearch.byMakeAndModel(${type}, ${make}, ${model}) - HTTP response code`, res && res.statusCode);

      if (err != null) {
        console.error('RecallSearch.byMakeAndModel() - Error while calling API: ', err);
        callback(err);
      } else {
        const recalls = this.mapRecallsToDto(body);
        callback(null, recalls);
      }
    });
  }

  static mapRecallsToDto(body) {
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
      return recallDto;
    });
  }
}

module.exports = RecallSearch;
