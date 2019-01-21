const ValidationResult = require('./ValidationResult');

const PRODUCT_GROUPS = ['R', 'RM', 'RCOMP', 'RCT', 'RPT', 'RSPV', 'RTW', 'RPC'];
const DATE_INVALID = 'invalid';

class RecallValidator {
  /**
   * Validates recall fields
   * @returns {bool} is recall valid
   */
  static isValid(
    launchDate,
    recallNumber,
    make,
    concern,
    defect,
    remedy,
    vehicleNumber,
    model,
    buildRange,
  ) {
    const validationResults = [
      this.isLaunchDateValid(launchDate),
      this.isRecallNumberValid(recallNumber),
      this.isVehicleNumberValid(vehicleNumber),
      this.isBuildRangeValid(buildRange, launchDate),
      this.areRequiredValuesNotEmpty(make, concern, defect, remedy, model),
    ];

    let isValid = true;
    const failureReasons = [];
    for (const result of validationResults) {
      if (!result.isValid) {
        isValid = false;
        failureReasons.push(result.failureReason);
      }
    }

    if (!isValid) {
      console.warn(`Recall ${make} ${model} with recall number ${recallNumber} is invalid.`);
      for (const reason of failureReasons) {
        console.info(`Reason: ${reason}`);
      }
    }

    return isValid;
  }

  /**
   * @param {string} launchDate
   * @returns {ValidationResult}
   */
  static isLaunchDateValid(launchDate) {
    if (launchDate === DATE_INVALID || launchDate == null) {
      return new ValidationResult(false, 'Launch date is empty or has invalid format.');
    }
    const today = new Date();
    const isValid = (new Date(launchDate)).getTime() <= today.getTime();
    const failureReason = isValid ? '' : 'Launch date occurs in the future.';
    return new ValidationResult(isValid, failureReason);
  }

  /**
   * @param {string} recallNumber
   * @returns {ValidationResult}
   */
  static isRecallNumberValid(recallNumber) {
    const [productGroup, year, number] = recallNumber.split('/');
    if (productGroup && year && number && !Number.isNaN(parseInt(year, 10))) {
      const thisYear = (new Date()).getFullYear();
      let fullYear = parseInt(year, 10);

      if (year.length === 2) {
        fullYear += 1900;
      }

      const isValid = PRODUCT_GROUPS.includes(productGroup) && fullYear <= thisYear;
      const failureReason = isValid ? '' : "Recall number's product group is invalid or year occurs in the future.";
      return new ValidationResult(isValid, failureReason);
    }
    return new ValidationResult(false, 'Recall number has invalid syntax.');
  }

  /**
   * @param {string} vehicleNumber
   * @returns {ValidationResult}
   */
  static isVehicleNumberValid(vehicleNumber) {
    const isValid = !Number.isNaN(parseInt(vehicleNumber, 10));
    const reason = isValid ? '' : 'Vehicle number is not a number.';
    return new ValidationResult(isValid, reason);
  }

  /**
   * @param {Array} buildRange
   * @param {string} launchDate
   * @returns {ValidationResult}
   */
  static isBuildRangeValid(buildRange, launchDate) {
    let isRangeValid = true;
    let failureReason = '';
    for (const build of buildRange) {
      if (!this.isBuildStartValid(build.start, launchDate).isValid
      || !this.isBuildEndValid(build.start, build.end).isValid) {
        isRangeValid = false;
        failureReason = `${this.isBuildStartValid(build.start, launchDate).failureReason} ${this.isBuildEndValid(build.start, build.end).failureReason}`;
      }
    }
    return new ValidationResult(isRangeValid, failureReason);
  }

  /**
   * @param {string} buildStart
   * @param {string} launchDate
   * @returns {ValidationResult}
   */
  static isBuildStartValid(buildStart, launchDate) {
    if (buildStart != null) {
      if (buildStart === DATE_INVALID) {
        return new ValidationResult(false, 'Build start has invalid format.');
      }
      const isValid = (new Date(buildStart)).getTime() <= (new Date(launchDate)).getTime();
      const failureReason = isValid ? '' : 'Build start occurs after launch date.';
      return new ValidationResult(isValid, failureReason);
    }
    return new ValidationResult(true, '');
  }

  /**
   * @param {string} buildStart
   * @param {string} buildEnd
   * @returns {ValidationResult}
   */
  static isBuildEndValid(buildStart, buildEnd) {
    if (buildEnd != null) {
      if (buildEnd === DATE_INVALID) {
        return new ValidationResult(false, 'Build end has invalid format.');
      }

      if (buildStart != null) {
        const isValid = (new Date(buildEnd)).getTime() >= (new Date(buildStart)).getTime();
        const failureReason = isValid ? '' : 'Build end occurs before build start.';
        return new ValidationResult(isValid, failureReason);
      }
    }
    return new ValidationResult(true, '');
  }

  /**
   * @param {string} make
   * @param {string} concern
   * @param {string} defect
   * @param {string} remedy
   * @param {string} model
   * @returns {ValidationResult}
   */
  static areRequiredValuesNotEmpty(make, concern, defect, remedy, model) {
    const areValuesNotEmpty = (make != null && make.length > 0)
      && (concern != null && concern.length > 0)
      && (defect != null && defect.length > 0)
      && (remedy != null && remedy.length > 0)
      && (model != null && model.length > 0);
    const failureReason = areValuesNotEmpty ? '' : 'One of required values (make, concern, defect, remedy, model) is empty.';

    return new ValidationResult(areValuesNotEmpty, failureReason);
  }
}

module.exports = RecallValidator;
