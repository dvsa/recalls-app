const url = require('url');
const recallSearch = require('../service/recallSearch');
const envVariables = require('../config/environmentVariables');
const makeValidator = require('../validators/vehicleMake');

const ASSETS_BASE_URL = envVariables.assetsBaseUrl;

class VehicleMakeController {
  static makesList(errorMessage, response, recallType) {
    // TODO: handle err
    recallSearch.fetchAllMakes(recallType, (err, makes) => {
      response.render('vehicle-make.njk', {
        assetsBaseUrl: ASSETS_BASE_URL,
        makes,
        errorMessage,
      });
    });
  }

  static submitMake(make, recallType, response) {
    if (makeValidator.isValid(make)) {
      response.redirect(url.format({
        pathname: 'results-page',
        query: { make },
      }));
    } else {
      const errorMessage = makeValidator.getErrorMessage();
      this.makesList(errorMessage, response, recallType);
    }
  }
}

module.exports = VehicleMakeController;
