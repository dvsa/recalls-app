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
        const recallTypePlural = recallType === 'vehicle' ? `${recallType}s` : recallType;
        const smartSurveyFeedback = this.prepareSmartSurveyFeedback(recallType, make);
        response.render('vehicle-model.njk', {
          models,
          recallType,
          recallTypePlural,
          smartSurveyFeedback,
          make,
          errorMessage,
        });
      }
    });
  }

  static submitModel(response, recallType, make, model) {
    if (modelValidator.isValid(model)) {
      response.redirect(this.redirectPathForRecallType(response, recallType, model));
    } else {
      const errorMessage = modelValidator.getErrorMessage(recallType);
      this.modelsList(errorMessage, response, recallType, make);
    }
  }

  static redirectPathForRecallType(response, recallType, model) {
    if (recallType === 'equipment') {
      return `models/${encodeURIComponent(model)}/recalls`;
    }
    return `models/${encodeURIComponent(model)}/years`;
  }
}

module.exports = ModelController;
