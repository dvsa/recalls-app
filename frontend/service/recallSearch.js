const request = require('request');
const RecallDto = require('cvr-common/dto/recall');
const envVariables = require('../config/environmentVariables');

const RECALLS_BACKEND_URL = envVariables.recallsBackendUrl;
const BY_MAKE_ENDPOINT = 'search-by-make';
const FETCH_ALL_MAKES_ENDPOINT = 'fetch-all-makes';

class RecallSearch {
  static fetchAllMakes(type, callback) {
    request.get(`${RECALLS_BACKEND_URL}/${FETCH_ALL_MAKES_ENDPOINT}?type=${type}`, (err, res, body) => {
      console.info(`HTTP response status from /${FETCH_ALL_MAKES_ENDPOINT} for ${type}: `, res && res.statusCode);

      if (err != null) {
        console.error(`Error while calling API /${FETCH_ALL_MAKES_ENDPOINT} `, err);
        callback(err);
      } else {
        callback(null, JSON.parse(body));
      }
    });
  }

  static byMake(make, callback) {
    request.get(`${RECALLS_BACKEND_URL}/${BY_MAKE_ENDPOINT}?make=${make}`, (err, res, body) => {
      console.info(`HTTP response status from /${BY_MAKE_ENDPOINT} for make '${make}': `, res && res.statusCode);

      if (err != null) {
        console.error(`Error while calling API /${BY_MAKE_ENDPOINT} `, err);
        callback(err);
      } else {
        const recalls = this.mapRecallsToDto(body);
        callback(null, recalls);
      }
    });
  }

  static mapRecallsToDto(body) {
    const parsedRecalls = JSON.parse(body);
    const recallsDtos = [];

    for (let i = 0; i < parsedRecalls.length; i += 1) {
      const recall = parsedRecalls[i];
      const recallDto = new RecallDto();

      recallDto.make = recall.make;
      recallDto.model = recall.model;
      recallDto.recallNumber = recall.recallNumber;
      recallDto.defectDescription = recall.defectDescription;
      recallDto.launchDate = recall.launchDate;
      recallDto.concern = recall.concern;
      recallDto.remedy = recall.remedy;
      recallDto.affectedVehiclesNumber = recall.affectedVehiclesNumber;

      recallsDtos.push(recallDto);
    }
    return recallsDtos;
  }
}

module.exports = RecallSearch;
