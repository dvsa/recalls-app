const recallSearch = require('../service/recallSearch');
const pluralForm = require('../service/pluralForm');
const envVariables = require('../config/environmentVariables');

const ASSETS_BASE_URL = envVariables.assetsBaseUrl;
const FOUND_RECALLS_COUNT_HEADER_VEHICLE = 'This vehicle has <strong>[num] recall{s}.</strong>';
const FOUND_RECALLS_COUNT_HEADER_EQUIPMENT = 'This equipment has <strong>[num] recall{s}.</strong>';

class ResultsController {
  static resultsPage(make, recallType, response) {
    recallSearch.byMake(make, (err, recalls) => {
      if (err) {
        console.error(err);
      } else {
        const recallsCountHeader = this.getRecallsCountHeader(recallType);
        const foundRecallsCountHeader = pluralForm
          .getSingularOrPlural(recallsCountHeader, recalls.length);

        response.render('results-page.njk', {
          assetsBaseUrl: ASSETS_BASE_URL,
          make,
          foundRecallsCountHeader,
          recallType,
          recalls,
        });
      }
    });
  }

  static getRecallsCountHeader(recallType) {
    return (recallType === 'equipment') ? FOUND_RECALLS_COUNT_HEADER_EQUIPMENT : FOUND_RECALLS_COUNT_HEADER_VEHICLE;
  }
}

module.exports = ResultsController;
