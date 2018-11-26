const recallSearch = require('../service/recallSearch');
const pluralForm = require('../service/pluralForm');

const SmartSurveyFeedback = require('../helpers/SmartSurveyFeedback');

const FOUND_RECALLS_COUNT_HEADER_VEHICLE = 'This vehicle has <strong>[num] recall{s}.</strong>';
const FOUND_RECALLS_COUNT_HEADER_EQUIPMENT = 'This equipment has <strong>[num] recall{s}.</strong>';
const RECALL_TYPE_EQUIPMENT = 'equipment';

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
    if (recallType === RECALL_TYPE_EQUIPMENT) {
      const backLink = `vehicle-model?recallType=${recallType}&make=${encodeURIComponent(make)}`;
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
      const backLink = `vehicle-year?recallType=${recallType}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
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
      console.error(err);
    } else {
      const recallTypePlural = recallType === 'vehicle' ? `${recallType}s` : recallType;
      const params = {
        make,
        smartSurveyFeedback: this.prepareSmartSurveyFeedback(recallType, make, model, year),
        title,
        foundRecallsCountHeader: this.constructor.getRecallsCountHeader(recallType, recalls),
        recallType,
        recallTypePlural,
        recalls,
        backLink,
      };

      response.render('results-page.njk', params);
    }
  }

  static getRecallsCountHeader(recallType, recalls) {
    const recallsCountHeader = (recallType === RECALL_TYPE_EQUIPMENT)
      ? FOUND_RECALLS_COUNT_HEADER_EQUIPMENT
      : FOUND_RECALLS_COUNT_HEADER_VEHICLE;
    return pluralForm.getSingularOrPlural(recallsCountHeader, recalls.length);
  }
}

module.exports = ResultsController;
