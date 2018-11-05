const url = require('url');
const recallSearch = require('../service/recallSearch');
const makeValidator = require('../validators/vehicleMake');

class VehicleMakeController {
  static makesList(errorMessage, response, recallType) {
    // TODO: handle err
    recallSearch.fetchAllMakes(recallType, (err, makes) => {
      response.render('vehicle-make.njk', {
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
