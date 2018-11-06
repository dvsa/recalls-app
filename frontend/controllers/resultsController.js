const recallSearch = require('../service/recallSearch');
const pluralForm = require('../service/pluralForm');
const envVariables = require('../config/environmentVariables');

const ASSETS_BASE_URL = envVariables.assetsBaseUrl;
const FOUND_RECALLS_COUNT_HEADER = 'This vehicle has <strong>[num] recall{s}.</strong>';

class ResultsController {
  static resultsPage(make, response) {
    recallSearch.byMake(make, (err, recalls) => {
      const thisMake = recalls[0].make; // TODO: check errors/nulls
      const model = recalls[0].model;
      const foundRecallsCountHeader = pluralForm
        .getSingularOrPlural(FOUND_RECALLS_COUNT_HEADER, recalls.length);

      response.render('results-page.njk', {
        assetsBaseUrl: ASSETS_BASE_URL,
        make: thisMake,
        model,
        foundRecallsCountHeader,
        recalls,
      });
    });
  }
}

module.exports = ResultsController;
