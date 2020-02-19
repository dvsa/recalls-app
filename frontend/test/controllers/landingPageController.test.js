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

  describe('cookiePolicy', () => {
    it('should pass smart survey feedback variables to the template', () => {
      landingPageController.cookiePolicy(res);

      expect(res.render.calledOnce).to.equal(true);
      expect(res.render.args[0][1]).to.include.keys('smartSurveyFeedback');
    });
  });

  describe('cookiePreferences', () => {
    it('should pass smart survey feedback variables to the template', () => {
      landingPageController.cookiePreferences(res);

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

  describe('recallNotListed', () => {
    const recallType = 'equipment';
    const make = 'honda';

    it('should pass smart survey feedback variables to the template', () => {
      landingPageController.recallNotListed(res, recallType, make);

      expect(res.render.calledOnce).to.equal(true);
      expect(res.render.args[0][1]).to.include.keys('smartSurveyFeedback');
    });

    it('should create correct back link when make argument is passed', () => {
      landingPageController.recallNotListed(res, recallType, make);

      expect(res.render.calledOnce).to.equal(true);
      expect(res.render.args[0][1]).to.include.keys('backLink');
      expect(res.render.args[0][1].backLink).to.equal(`/recall-type/${recallType}/make/${make}/model`);
    });

    it('should create correct back link without make argument', () => {
      landingPageController.recallNotListed(res, recallType);

      expect(res.render.calledOnce).to.equal(true);
      expect(res.render.args[0][1]).to.include.keys('backLink');
      expect(res.render.args[0][1].backLink).to.equal(`/recall-type/${recallType}/make`);
    });
  });
});
