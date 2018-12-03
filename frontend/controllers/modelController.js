const RecallType = require('cvr-common/model/recallTypeEnum');
const recallSearch = require('../service/recallSearch');
const messages = require('../messages/messages.en');
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
        const recallsAvailabilityNotice = recallType === RecallType.vehicle
          ? messages.AVAILABILITY_NOTICE.VEHICLE
          : messages.AVAILABILITY_NOTICE.EQUIPMENT;

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
    if (recallType === RecallType.equipment) {
      return `model/${encodeURIComponent(model)}/recalls`;
    }
    return `model/${encodeURIComponent(model)}/year`;
  }
}

module.exports = ModelController;
