const sinon = require('sinon');
const { expect } = require('chai');
const landingPageController = require('../../controllers/landingPageController');

const res = { render: () => {} };
let sandbox;

describe('LandingPageController', () => {
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.spy(res, 'render');
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('homePage', () => {
    it('should pass smart survey feedback variables to the template', () => {
      landingPageController.homePage({}, res);

      expect(res.render.calledOnce).to.equal(true);
      expect(res.render.args[0][1]).to.include.keys('smartSurveyFeedback');
    });
  });

  describe('cookies', () => {
    it('should pass smart survey feedback variables to the template', () => {
      landingPageController.cookies(res);

      expect(res.render.calledOnce).to.equal(true);
      expect(res.render.args[0][1]).to.include.keys('smartSurveyFeedback');
    });
  });

  describe('termsAndConditions', () => {
    it('should pass smart survey feedback variables to the template', () => {
      landingPageController.termsAndConditions(res);

      expect(res.render.calledOnce).to.equal(true);
      expect(res.render.args[0][1]).to.include.keys('smartSurveyFeedback');
    });
  });
});
