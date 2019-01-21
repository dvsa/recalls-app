class ValidationResult {
  /**
   * @param {bool} isValid
   * @param {string} failureReason
   */
  constructor(isValid, failureReason) {
    this.isValid = isValid;
    this.failureReason = failureReason;
  }
}

module.exports = ValidationResult;
