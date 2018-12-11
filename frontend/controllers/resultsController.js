const RecallType = require('cvr-common/model/recallTypeEnum');
const logger = require('cvr-common/logger/loggerFactory').create();
const recallSearch = require('../service/recallSearch');
const pluralForm = require('../service/pluralForm');
const SmartSurveyFeedback = require('../helpers/SmartSurveyFeedback');

const FOUND_RECALLS_COUNT_HEADER_VEHICLE = 'This vehicle has <strong>[num] recall{s}.</strong>';
const FOUND_RECALLS_COUNT_HEADER_EQUIPMENT = 'This equipment has <strong>[num] recall{s}.</strong>';

class ResultsController {
  constructor() {
    this.smartSurveyFeedback = SmartSurveyFeedback.getInstance();
  }

  prepareSmartSurveyFeedback(recallType, make, model, year) {
    this.smartSurveyFeedback.type = recallType;
    this.smartSurveyFeedback.make = make;
    this.smartSurveyFeedback.model = model;
    this.smartSurveyFeedback.year = year;
    return this.smartSurveyFeedback;
  }

  resultsPage(response, recallType, make, model, year) {
    if (recallType === RecallType.equipment) {
      const backLink = '../../model';
      const title = `${make} ${model}`;

      recallSearch.byMakeAndModel(recallType, make, model, (err, recalls) => {
        this.renderOrFail(
          response,
          recallType,
          make,
          model,
          year,
          title,
          backLink,
          err,
          recalls,
        );
      });
    } else {
      const backLink = '../../year';
      const title = `${make} ${model} ${year}`;

      recallSearch.byMakeModelAndYear(recallType, make, model, year, (err, recalls) => {
        this.renderOrFail(
          response,
          recallType,
          make,
          model,
          year,
          title,
          backLink,
          err,
          recalls,
        );
      });
    }
  }

  renderOrFail(
    response,
    recallType,
    make,
    model,
    year,
    title,
    backLink,
    err,
    recalls,
  ) {
    if (err) {
      logger.error(err);
    } else {
      const recallTypePlural = recallType === RecallType.vehicle ? `${recallType}s` : recallType;
      const params = {
        make,
        smartSurveyFeedback: this.prepareSmartSurveyFeedback(recallType, make, model, year),
        title,
        recallTypePlural,
        foundRecallsCountHeader: this.constructor.getRecallsCountHeader(recallType, recalls),
        recallType,
        recalls,
        backLink,
      };

      response.render('results-page.njk', params);
    }
  }

  static getRecallsCountHeader(recallType, recalls) {
    const recallsCountHeader = (recallType === RecallType.equipment)
      ? FOUND_RECALLS_COUNT_HEADER_EQUIPMENT
      : FOUND_RECALLS_COUNT_HEADER_VEHICLE;
    return pluralForm.getSingularOrPlural(recallsCountHeader, recalls.length);
  }
}

module.exports = ResultsController;
