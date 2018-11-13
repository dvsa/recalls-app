const assert = require('assert');
const SmartSurveyFeedback = require('../../helpers/SmartSurveyFeedback.js');

describe('SmartSurveyFeedback', () => {
  describe('setPageParams()', () => {
    it('should set the relevant smart survey properties', () => {
      const params = {
        recallType: '1', make: '2', model: '3', year: 123,
      };
      const smartSurveyFeedback = SmartSurveyFeedback.getInstance();

      smartSurveyFeedback.setPageParams(params);
      assert.equal(smartSurveyFeedback.args.make, params.make);
      assert.equal(smartSurveyFeedback.args.model, params.model);
      assert.equal(smartSurveyFeedback.args.year, params.year);
      assert.equal(smartSurveyFeedback.args.type, params.recallType);
    });
  });

  describe('getQueryString()', () => {
    const testData = [
      {
        params: {
          year: 123, make: '1', model: '2', recallType: '3',
        },
        expectedQueryString: '?year=123&make=1&model=2&type=3',
      }, {
        params: { make: '1', model: '2', recallType: '3' },
        expectedQueryString: '?make=1&model=2&type=3',
      }, {
        params: { recallType: '321' },
        expectedQueryString: '?type=321',
      }, {
        params: {},
        expectedQueryString: '',
      }, {
        params: null,
        expectedQueryString: '',
      }, {
        params: { make: null, model: '2', recallType: '3 4' },
        expectedQueryString: '?model=2&type=3%204',
      }, {
        params: { make: '&param=inject', model: '1/2', recallType: '' },
        expectedQueryString: '?make=%26param%3Dinject&model=1%2F2',
      }, {
        params: { make: '' },
        expectedQueryString: '',
      },
    ];

    testData.forEach((data) => {
      it(`should build queryparams for ${JSON.stringify(data.params)}`, () => {
        const smartSurveyFeedback = SmartSurveyFeedback.getInstance();
        if (data.params != null) {
          smartSurveyFeedback.setPageParams(data.params);
        }

        assert.equal(smartSurveyFeedback.getQueryString(), data.expectedQueryString);
      });
    });
  });

  describe('getFormUrl', () => {
    const url = 'https://www.smartsurvey.co.uk/s/VCM6G';

    const testData = [
      {
        params: {
          year: 123, make: '1', model: '2', recallType: '3',
        },
        expectedFormUrl: `${url}?year=123&make=1&model=2&type=3`,
      }, {
        params: {},
        expectedFormUrl: url,
      },
    ];

    testData.forEach((data) => {
      it(`should build url for ${JSON.stringify(data.params)}`, () => {
        const smartSurveyFeedback = SmartSurveyFeedback.getInstance();
        if (data.params != null) {
          smartSurveyFeedback.setPageParams(data.params);
        }

        assert.equal(smartSurveyFeedback.formUrl, data.expectedFormUrl);
      });
    });
  });
});
