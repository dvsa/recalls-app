const { logger } = require('cvr-common/src/logger/loggerFactory');
const ManufactureYear = require('../validators/manufactureYear');
const SmartSurveyFeedback = require('../helpers/SmartSurveyFeedback');

class YearController {
  constructor() {
    this.yearValidator = new ManufactureYear();
    this.smartSurveyFeedback = SmartSurveyFeedback.getInstance();
  }

  prepareSmartSurveyFeedback(recallType, make, model) {
    this.smartSurveyFeedback.type = recallType;
    this.smartSurveyFeedback.make = make;
    this.smartSurveyFeedback.model = model;
    return this.smartSurveyFeedback;
  }

  enterYear(errorMessage, response, recallType, make, model) {
    response.render('vehicle-year.njk', {
      recallType,
      smartSurveyFeedback: this.prepareSmartSurveyFeedback(recallType, make, model),
      make,
      model,
      errorMessage,
    });
  }

  submitYear(response, recallType, make, model, year) {
    const trimmedYear = String.prototype.trim.call(year);
    if (this.yearValidator.isValid(trimmedYear)) {
      logger.debug(`Year ${trimmedYear} is valid`);
      response.redirect(`year/${trimmedYear}/recalls`);
    } else {
      const errorMessage = this.yearValidator.getErrorMessage();
      logger.info('Year is not valid: ', errorMessage);
      this.enterYear(errorMessage, response, recallType, make, model);
    }
  }
}

module.exports = YearController;
