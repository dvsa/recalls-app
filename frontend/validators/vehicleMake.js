class VehicleMakeValidator {
  static getErrorMessage() {
    return 'Select the vehicle make';
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
