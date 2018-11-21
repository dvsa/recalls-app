class VehicleModelValidator {
  static getErrorMessage() {
    return 'Select the vehicle model';
  }

  /**
   * Returns true if given model is not empty
   * @param model vehicle model
   */
  static isValid(model) {
    return model != null && model !== '';
  }
}

module.exports = VehicleModelValidator;
