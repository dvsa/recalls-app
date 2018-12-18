const logger = require('cvr-common/src/logger/loggerFactory').create();

class SmartSurveyFeedback {
  constructor() {
    this.args = {};
    this.count = 1;
  }

  set type(value) {
    this.args.type = value;
  }

  set make(value) {
    this.args.make = value;
  }

  set model(value) {
    this.args.model = value;
  }

  set year(value) {
    this.args.year = value;
  }

  formUrl() {
    const baseUrl = 'https://www.smartsurvey.co.uk/s/VCM6G';

    return `${baseUrl}${this.getQueryString()}`;
  }

  /**
  * Sets feedback queryparams.
  *
  * @param {*} pageParams
  */
  setPageParams(pageParams) {
    this.year = pageParams.year;
    this.make = pageParams.make;
    this.model = pageParams.model;
    this.type = pageParams.recallType;
  }

  getQueryString() {
    const queryString = Object.keys(this.args)
      .filter(key => this.args[key] != null && this.args[key] !== '')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.args[key])}`)
      .join('&');

    logger.debug('SmartSurvey query stream constructed:', queryString);
    return queryString ? `?${queryString}` : '';
  }

  static getInstance() {
    return new SmartSurveyFeedback();
  }
}

module.exports = SmartSurveyFeedback;
