const RecallType = require('cvr-common/src/model/recallTypeEnum');
const { logger } = require('cvr-common/src/logger/loggerFactory');
const recallSearch = require('../service/recallSearch');
const makeValidator = require('../validators/vehicleMake');
const messages = require('../messages/messages.en');
const SmartSurveyFeedback = require('../helpers/SmartSurveyFeedback');

class MakeController {
  static makesList(errorMessage, response, recallType) {
    recallSearch.fetchAllMakes(recallType, (err, makes) => {
      if (err) {
        logger.error('Error while fetching makes:', err);
      } else {
        const recallsAvailabilityNotice = recallType === RecallType.vehicle
          ? messages.AVAILABILITY_NOTICE.VEHICLE
          : messages.AVAILABILITY_NOTICE.EQUIPMENT;

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
      logger.debug(`Make ${make} is valid`);
      response.redirect(`make/${encodeURIComponent(make)}/model`);
    } else {
      const errorMessage = makeValidator.getErrorMessage(recallType);
      logger.info(`Make invalid: ${errorMessage}`);
      this.makesList(errorMessage, response, recallType);
    }
  }
}

module.exports = MakeController;
