const url = require('url');
const recallSearch = require('../service/recallSearch');
const modelValidator = require('../validators/vehicleModel');
const SmartSurveyFeedback = require('../helpers/SmartSurveyFeedback');

class ModelController {
  static prepareSmartSurveyFeedback(recallType, make) {
    const smartSurveyFeedback = SmartSurveyFeedback.getInstance();
    smartSurveyFeedback.type = recallType;
    smartSurveyFeedback.make = make;
    return smartSurveyFeedback;
  }

  static modelsList(errorMessage, response, recallType, make) {
    recallSearch.fetchAllModels(recallType, make, (err, models) => {
      if (err) {
        console.error(err);
      } else {
        const smartSurveyFeedback = this.prepareSmartSurveyFeedback(recallType, make);
        response.render('vehicle-model.njk', {
          models,
          recallType,
          smartSurveyFeedback,
          make,
          errorMessage,
        });
      }
    });
  }

  static submitModel(response, recallType, make, model) {
    if (modelValidator.isValid(model)) {
      response.redirect(url.format({
        pathname: this.redirectPathForRecallType(recallType),
        query: { model, make, recallType },
      }));
    } else {
      const errorMessage = modelValidator.getErrorMessage();
      this.modelsList(errorMessage, response, recallType, make);
    }
  }

  static redirectPathForRecallType(recallType) {
    if (recallType === 'equipment') {
      return 'results-page';
    }
    return 'vehicle-year';
  }
}

module.exports = ModelController;
