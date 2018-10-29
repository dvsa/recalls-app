const recallSearch = require('../service/recallSearch');
const pluralForm = require('../service/pluralForm');
const envVariables = require('../config/environmentVariables');

const ASSETS_BASE_URL = envVariables.assetsBaseUrl;
const FOUND_RECALLS_COUNT_HEADER = 'This vehicle has <strong>[num] recall{s}.</strong>';

class ResultsController {
  static resultsPage(make, recallType, response) {
    recallSearch.byMake(make, (err, recalls) => {
      if (err) {
        console.error(err);
      } else {
        const foundRecallsCountHeader = pluralForm
          .getSingularOrPlural(FOUND_RECALLS_COUNT_HEADER, recalls.length);

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
}

module.exports = ResultsController;
