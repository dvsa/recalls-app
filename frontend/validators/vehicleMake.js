class VehicleMakeValidator {
  static getErrorMessage(recallType) {
    return `Select the ${recallType} make`;
  }

  /**
   * Returns true if given make is not empty
   * @param make vehicle make
   */
  static isValid(make) {
    return make != null && make !== '';
  }
}

module.exports = VehicleMakeValidator;
