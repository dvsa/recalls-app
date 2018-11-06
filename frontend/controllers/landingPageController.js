const url = require('url');
const envVariables = require('../config/environmentVariables');
const typeValidator = require('../validators/recallType');

const ASSETS_BASE_URL = envVariables.assetsBaseUrl;

class FrontendController {
  static homePage(errorMessage, response) {
    response.render('type-of-recall.njk', {
      assetsBaseUrl: ASSETS_BASE_URL,
      errorMessage,
    });
  }

  static submitRecallType(req, response, recallType) {
    if (typeValidator.isValid(recallType)) {
      response.redirect(url.format({
        pathname: 'vehicle-make',
        query: { recallType },
      }));
    } else {
      const errorMessage = typeValidator.getErrorMessage();
      this.homePage(errorMessage, response);
    }
  }
}

module.exports = FrontendController;
