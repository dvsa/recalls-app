
class ManufactureYearValidator {
  constructor() {
    this.EMPTY_YEAR_MSG = 'Enter the year the vehicle was made';
    this.DIGITS_ONLY_MSG = 'Enter a year using numbers 0 to 9';
    this.FOUR_DIGITS_MSG = 'Enter a real year';
    this.IN_THE_FUTURE_MSG = 'Year must not be in the future';
  }

  getErrorMessage() {
    return this.errorMessage || this.EMPTY_YEAR_MSG;
  }

  /**
   * Returns true if given year is not empty
   * @param year vehicle year
   */
  isValid(year) {
    if (this.constructor.isEmpty(year)) {
      return this.failWithErrorMessage(this.EMPTY_YEAR_MSG);
    }
    if (!this.constructor.isDigitsOnly(year)) {
      return this.failWithErrorMessage(this.DIGITS_ONLY_MSG);
    }
    if (!this.constructor.containsFourDigits(year)) {
      return this.failWithErrorMessage(this.FOUR_DIGITS_MSG);
    }
    if (this.constructor.isInTheFuture(year)) {
      return this.failWithErrorMessage(this.IN_THE_FUTURE_MSG);
    }
    return true;
  }

  failWithErrorMessage(message) {
    this.errorMessage = message;
    return false;
  }

  static isDigitsOnly(value) {
    return value.match(new RegExp('^\\d+$'));
  }

  static isEmpty(value) {
    return value == null || value === '';
  }

  static containsFourDigits(value) {
    return value.length === 4;
  }

  static isInTheFuture(year) {
    return year > this.getCurrentYear();
  }

  static getCurrentYear() {
    return (new Date()).getFullYear();
  }
}

module.exports = ManufactureYearValidator;
