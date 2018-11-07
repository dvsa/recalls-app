const recallSearch = require('../service/recallSearch');
const pluralForm = require('../service/pluralForm');
const envVariables = require('../config/environmentVariables');

const ASSETS_BASE_URL = envVariables.assetsBaseUrl;
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
    return `This ${recallType} has <strong>[num] recall{s}.</strong>`;
  }
}

module.exports = ResultsController;
