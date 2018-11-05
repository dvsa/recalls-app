const recallSearch = require('../service/recallSearch');
const envVariables = require('../config/environmentVariables');

const ASSETS_BASE_URL = envVariables.assetsBaseUrl;

class FrontendController {
  static homePage(response) {
    // TODO: if validation was successful, redirect to the next page,
    // otherwise display this page again (with errors)
    response.render('type-of-recall.njk', {
      assetsBaseUrl: ASSETS_BASE_URL,
    });
  }

  static vehicleMake(recallType, response) {
    recallSearch.fetchAllMakes(recallType, (err, makes) => {
      response.render('vehicle-make.njk', {
        assetsBaseUrl: ASSETS_BASE_URL,
        makes,
      });
    });
  }

  static resultsPage(make, response) {
    recallSearch.byMake(make, (err, recalls) => {
      const thisMake = recalls[0].make; // TODO: check errors/nulls
      const model = recalls[0].model;
      const recallsNumber = recalls.length;

      response.render('results-page.njk', {
        assetsBaseUrl: ASSETS_BASE_URL,
        make: thisMake,
        model,
        recallsNumber,
        recalls, // TODO: BL-8752 pass this response to a new page
      });
    });
  }
}

module.exports = FrontendController;
