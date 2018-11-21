const recallSearch = require('../service/recallSearch');
const pluralForm = require('../service/pluralForm');

const SmartSurveyFeedback = require('../helpers/SmartSurveyFeedback');

const FOUND_RECALLS_COUNT_HEADER_VEHICLE = 'This vehicle has <strong>[num] recall{s}.</strong>';
const FOUND_RECALLS_COUNT_HEADER_EQUIPMENT = 'This equipment has <strong>[num] recall{s}.</strong>';

class ResultsController {
  static resultsPage(make, model, recallType, response) {
    recallSearch.byMakeAndModel(recallType, make, model, (err, recalls) => {
      if (err) {
        console.error(err);
      } else {
        const recallsCountHeader = this.getRecallsCountHeader(recallType);
        const foundRecallsCountHeader = pluralForm
          .getSingularOrPlural(recallsCountHeader, recalls.length);
        const smartSurveyFeedback = SmartSurveyFeedback.getInstance();
        const params = {
          make,
          model,
          foundRecallsCountHeader,
          recallType,
          recalls,
        };

        smartSurveyFeedback.setPageParams(params);
        params.smartSurveyFeedback = smartSurveyFeedback;

        response.render('results-page.njk', params);
      }
    });
  }

  static getRecallsCountHeader(recallType) {
    return (recallType === 'equipment') ? FOUND_RECALLS_COUNT_HEADER_EQUIPMENT : FOUND_RECALLS_COUNT_HEADER_VEHICLE;
  }
}

module.exports = ResultsController;
