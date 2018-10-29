const validTypes = ['vehicle', 'equipment'];

class RecallTypeValidator {
  static getErrorMessage() {
    return 'Please select an option';
  }

  /**
   * Returns true if given type was found in validTypes
   * @param type type of recall
   */
  static isValid(type) {
    return (validTypes.indexOf(type) > -1);
  }
}

module.exports = RecallTypeValidator;
