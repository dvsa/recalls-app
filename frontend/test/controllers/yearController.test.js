const sinon = require('sinon');
const { expect } = require('chai');
const YearController = require('../../controllers/yearController');

const yearController = new YearController();

const res = { render: () => {} };
let sandbox;

const RECALL_TYPE = 'vehicle';
const MAKE = 'BMW';
const MODEL = 'E90';

describe('YearController', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.spy(res, 'render');
  });
  afterEach(() => {
    sandbox.restore();
  });
  describe('enterYear', () => {
    it('should pass smart survey feedback variables to the template', () => {
      yearController.enterYear({}, res, RECALL_TYPE, MAKE, MODEL);

      expect(res.render.calledOnce).to.equal(true);
      expect(res.render.args[0][1]).to.include.keys('smartSurveyFeedback');
      expect(res.render.args[0][1].smartSurveyFeedback.args.type).to.equal(RECALL_TYPE);
      expect(res.render.args[0][1].smartSurveyFeedback.args.make).to.equal(MAKE);
      expect(res.render.args[0][1].smartSurveyFeedback.args.model).to.equal(MODEL);
    });
  });
});
