const url = require('url');
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
      response.redirect(url.format({
        pathname: 'results-page',
        query: {
          model, make, recallType, year: trimmedYear,
        },
      }));
    } else {
      const errorMessage = this.yearValidator.getErrorMessage();
      this.enterYear(errorMessage, response, recallType, make, model);
    }
  }
}

module.exports = YearController;
