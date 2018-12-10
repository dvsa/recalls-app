const { logger } = require('cvr-common/src/logger/loggerFactory');
const envVariables = require('../config/environmentVariables');
const typeValidator = require('../validators/recallType');
const SmartSurveyFeedback = require('../helpers/SmartSurveyFeedback');

class FrontendController {
  static homePage(errorMessage, response) {
    response.render('type-of-recall.njk', {
      smartSurveyFeedback: SmartSurveyFeedback.getInstance(),
      errorMessage,
      documentsBaseUrl: envVariables.documentsBaseUrl,
    });
  }

  static submitRecallType(response, recallType) {
    if (typeValidator.isValid(recallType)) {
      response.redirect(`recall-type/${recallType}/make`);
    } else {
      const errorMessage = typeValidator.getErrorMessage();
      logger.info('Recall type is not valid: ', errorMessage);
      this.homePage(errorMessage, response);
    }
  }

  static cookies(response) {
    response.render('cookies.njk', {
      smartSurveyFeedback: SmartSurveyFeedback.getInstance(),
    });
  }

  static termsAndConditions(response) {
    response.render('terms-and-conditions.njk', {
      smartSurveyFeedback: SmartSurveyFeedback.getInstance(),
    });
  }
}

module.exports = FrontendController;
