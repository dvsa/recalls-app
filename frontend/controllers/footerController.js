class FooterController {
  static cookies(response) {
    response.render('cookies.njk');
  }

  static termsAndConditions(response) {
    response.render('terms-and-conditions.njk');
  }
}

module.exports = FooterController;
