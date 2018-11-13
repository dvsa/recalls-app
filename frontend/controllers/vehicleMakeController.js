const url = require('url');
const recallSearch = require('../service/recallSearch');
const makeValidator = require('../validators/vehicleMake');
const SmartSurveyFeedback = require('../helpers/SmartSurveyFeedback');

class VehicleMakeController {
  static makesList(errorMessage, response, recallType) {
    recallSearch.fetchAllMakes(recallType, (err, makes) => {
      if (err) {
        console.error(err);
      } else {
        const smartSurveyFeedback = SmartSurveyFeedback.getInstance();
        smartSurveyFeedback.type = recallType;

        response.render('vehicle-make.njk', {
          makes,
          recallType,
          smartSurveyFeedback,
          errorMessage,
        });
      }
    });
  }

  static submitMake(make, recallType, response) {
    if (makeValidator.isValid(make)) {
      response.redirect(url.format({
        pathname: 'results-page',
        query: { make, recallType },
      }));
    } else {
      const errorMessage = makeValidator.getErrorMessage();
      this.makesList(errorMessage, response, recallType);
    }
  }
}

module.exports = VehicleMakeController;
