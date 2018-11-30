const recallSearch = require('../service/recallSearch');
const makeValidator = require('../validators/vehicleMake');
const SmartSurveyFeedback = require('../helpers/SmartSurveyFeedback');

const NOTICE_VEHICLE = 'This service only includes vehicles that have been recalled.';
const NOTICE_EQUIPMENT = 'This service only includes equipment that has been recalled.';

class MakeController {
  static makesList(errorMessage, response, recallType) {
    recallSearch.fetchAllMakes(recallType, (err, makes) => {
      if (err) {
        console.error(err);
      } else {
        const recallsAvailabilityNotice = recallType === 'vehicle' ? NOTICE_VEHICLE : NOTICE_EQUIPMENT;
        const smartSurveyFeedback = SmartSurveyFeedback.getInstance();
        smartSurveyFeedback.type = recallType;

        response.render('vehicle-make.njk', {
          makes,
          recallType,
          recallsAvailabilityNotice,
          smartSurveyFeedback,
          errorMessage,
        });
      }
    });
  }

  static submitMake(response, recallType, make) {
    if (makeValidator.isValid(make)) {
      response.redirect(`makes/${encodeURIComponent(make)}/models`);
    } else {
      const errorMessage = makeValidator.getErrorMessage(recallType);
      this.makesList(errorMessage, response, recallType);
    }
  }
}

module.exports = MakeController;
