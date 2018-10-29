const url = require('url');
const typeValidator = require('../validators/recallType');

class FrontendController {
  static homePage(errorMessage, response) {
    response.render('type-of-recall.njk', {
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

  static cookies(response) {
    response.render('cookies.njk');
  }

  static termsAndConditions(response) {
    response.render('terms-and-conditions.njk');
  }
}

module.exports = FrontendController;
