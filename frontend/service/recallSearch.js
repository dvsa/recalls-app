const request = require('request');
const RecallDto = require('cvr-common/dto/recall');
const envVariables = require('../config/environmentVariables');

const RECALLS_BACKEND_URL = envVariables.recallsBackendUrl;
const BY_MAKE_ENDPOINT = 'search-by-make';
const FETCH_ALL_MAKES_ENDPOINT = 'fetch-all-makes';

class RecallSearch {
  static fetchAllMakes(type, callback) {
    // TODO: encode/decode recall type in URL?
    request(`${RECALLS_BACKEND_URL}/${FETCH_ALL_MAKES_ENDPOINT}?type=${type}`, (err, res, body) => {
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
    request(`${RECALLS_BACKEND_URL}/${BY_MAKE_ENDPOINT}?make=${make}`, (err, res, body) => {
      console.info(`HTTP response status from /${BY_MAKE_ENDPOINT} for make '${make}': `, res && res.statusCode);

      if (err != null) {
        console.error(`Error while calling API /${BY_MAKE_ENDPOINT} `, err);
        callback(err);
      }

      console.info(`requested body: ${body}`); // TODO: remove
      let recalls = [
        // TODO: remove adding dummy data to real recalls
        new RecallDto('Audi', 'A6', 'recallNumber', 'defectDesc', 'launchDate', 'concern', 'remedy', '999'),
        new RecallDto('Make2', 'Model2', 'recallNumber2', 'defectDesc2', 'launchDate2', 'concern2', 'remedy2', '9999'),
      ];

      recalls = recalls.concat(this.mapRecallsToDto(body));

      callback(null, recalls);
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
