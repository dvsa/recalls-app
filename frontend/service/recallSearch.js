const request = require('request');
const envVariables = require('../config/environmentVariables');

const RECALLS_BACKEND_URL = envVariables.recallsBackendUrl;
const BY_MAKE_ENDPOINT = 'search-by-make';

class RecallSearch {
  static byMake(make, callback) {
    request(`${RECALLS_BACKEND_URL}/${BY_MAKE_ENDPOINT}/?make=${make}`, (err, res, body) => {
      console.log(`Requesting make from /${BY_MAKE_ENDPOINT}: `, make);
      if (err != null) {
        // TODO: BL-8752 Report non-200 HTTP responses
        console.error(`Error while calling API /${BY_MAKE_ENDPOINT} `, err);
        callback(err);
      }
      console.log(`HTTP response status from /${BY_MAKE_ENDPOINT}: `, res && res.statusCode);
      callback(null, body);
    });
  }
}

module.exports = RecallSearch;
