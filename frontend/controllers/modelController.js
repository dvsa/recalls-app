const recallSearch = require('../service/recallSearch');
const modelValidator = require('../validators/vehicleModel');
const SmartSurveyFeedback = require('../helpers/SmartSurveyFeedback');

const NOTICE_VEHICLE = 'This service only includes vehicles that have been recalled.';
const NOTICE_EQUIPMENT = 'This service only includes equipment that has been recalled.';

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
        const recallsAvailabilityNotice = recallType === 'vehicle' ? NOTICE_VEHICLE : NOTICE_EQUIPMENT;
        const smartSurveyFeedback = this.prepareSmartSurveyFeedback(recallType, make);
        response.render('vehicle-model.njk', {
          models,
          recallType,
          recallsAvailabilityNotice,
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
