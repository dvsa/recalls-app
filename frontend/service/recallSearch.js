const request = require('request');
const RecallDto = require('../../common/dto/recall');
const envVariables = require('../config/environmentVariables');

const RECALLS_BACKEND_URL = envVariables.recallsBackendUrl;
const BY_MAKE_ENDPOINT = 'search-by-make';

class RecallSearch {
  static byMake(make, callback) {
    request(`${RECALLS_BACKEND_URL}/${BY_MAKE_ENDPOINT}/?make=${make}`, (err, res, body) => {
      console.info(`Requesting make from /${BY_MAKE_ENDPOINT}: `, make);
      if (err != null) {
        // TODO: BL-8752 Report non-200 HTTP responses
        console.error(`Error while calling API /${BY_MAKE_ENDPOINT} `, err);
        callback(err);
      }
      console.info(`HTTP response status from /${BY_MAKE_ENDPOINT}: `, res && res.statusCode);

      // TODO: map the data from request body
      console.info(`requested body: ${body}`); // TODO: remove
      const recalls = [
        new RecallDto('Audi', 'A6', 'recallNumber', 'defectDesc', 'launchDate', 'concern', 'remedy', '999'),
        new RecallDto('Make2', 'Model2', 'recallNumber2', 'defectDesc2', 'launchDate2', 'concern2', 'remedy2', '9999'),
      ];

      callback(null, recalls);
    });
  }
}

module.exports = RecallSearch;
