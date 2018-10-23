const recallSearch = require('../service/recallSearch');
const envVariables = require('../config/environmentVariables');

const ASSETS_BASE_URL = envVariables.assetsBaseUrl;

class FrontendController {
  static homePage(make, response) {
    recallSearch.byMake(make, (err, body) => {
      response.render('type-of-recall.njk', {
        assetsBaseUrl: ASSETS_BASE_URL,
        recallsResponse: body, // TODO: BL-8752 pass this response to a new page
      });
    });
  }
}

module.exports = FrontendController;
