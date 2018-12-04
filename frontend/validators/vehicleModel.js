class VehicleModelValidator {
  static getErrorMessage(recallType) {
    return `Select the ${recallType} model`;
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
