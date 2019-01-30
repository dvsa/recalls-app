const { expect } = require('chai');
const RecallValidator = require('../../src/helpers/RecallValidator');

const DATE_INVALID = 'invalid';

describe('RecallValidator', () => {
  describe('isLaunchDateValid()', () => {
    it('Should return true when valid launch date is passed', (done) => {
      const result = RecallValidator.isLaunchDateValid('2017-01-01');

      expect(result.isValid).to.be.true;
      expect(result.failureReason).to.equal('');
      done();
    });

    it('Should return false when launch date is empty', (done) => {
      const result = RecallValidator.isLaunchDateValid(null);

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Launch date is empty or has invalid format.');
      done();
    });

    it('Should return false when launch date equals DATE_INVALID', (done) => {
      const result = RecallValidator.isLaunchDateValid(DATE_INVALID);

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Launch date is empty or has invalid format.');
      done();
    });

    it('Should return false when launch date occurs in the future', (done) => {
      const result = RecallValidator.isLaunchDateValid('2219-01-01');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Launch date occurs in the future.');
      done();
    });
  });

  describe('isRecallNumberValid()', () => {
    it('Should return true when valid recall number is passed', (done) => {
      const result = RecallValidator.isRecallNumberValid('RSPV/2008/003');

      expect(result.isValid).to.be.true;
      expect(result.failureReason).to.equal('');
      done();
    });

    it('Should return true when valid recall number with two-digit year is passed', (done) => {
      const result = RecallValidator.isRecallNumberValid('RM/95/003');

      expect(result.isValid).to.be.true;
      expect(result.failureReason).to.equal('');
      done();
    });

    it('Should return false when recall number has incorrect format', (done) => {
      const result = RecallValidator.isRecallNumberValid('RSPV-2008-003');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Recall number has invalid syntax.');
      done();
    });

    it('Should return false when recall number year part is not a number', (done) => {
      const result = RecallValidator.isRecallNumberValid('RSPV/ABC/003');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Recall number has invalid syntax.');
      done();
    });

    it('Should return false when recall number\'s year occurs in the future', (done) => {
      const result = RecallValidator.isRecallNumberValid('RSPV/2222/003');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Recall number\'s product group is invalid or year occurs in the future.');
      done();
    });

    it('Should return false when recall number\'s product group is incorrect', (done) => {
      const result = RecallValidator.isRecallNumberValid('RRRRR/2008/003');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Recall number\'s product group is invalid or year occurs in the future.');
      done();
    });
  });

  describe('isVehicleNumberValid()', () => {
    it('Should return true when valid vehicle number is passed', (done) => {
      const result = RecallValidator.isVehicleNumberValid('200');

      expect(result.isValid).to.be.true;
      expect(result.failureReason).to.equal('');
      done();
    });

    it('Should return false when vehicle number is not a number', (done) => {
      const result = RecallValidator.isVehicleNumberValid('ABC');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Vehicle number is not a number.');
      done();
    });
  });

  describe('isBuildStartValid()', () => {
    it('Should return true when build start date is valid and occurs before launch date', (done) => {
      const result = RecallValidator.isBuildStartValid('2017-01-01', '2017-05-01');

      expect(result.isValid).to.be.true;
      expect(result.failureReason).to.equal('');
      done();
    });

    it('Should return true when build start date is null', (done) => {
      const result = RecallValidator.isBuildStartValid(null, '2017-05-01');

      expect(result.isValid).to.be.true;
      expect(result.failureReason).to.equal('');
      done();
    });

    it('Should return false when build start date equals DATE_INVALID', (done) => {
      const result = RecallValidator.isBuildStartValid(DATE_INVALID, '2017-05-01');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Build start has invalid format.');
      done();
    });

    it('Should return false when build start date occurs after launch date', (done) => {
      const result = RecallValidator.isBuildStartValid('2017-05-01', '2017-01-01');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Build start occurs after launch date.');
      done();
    });
  });

  describe('isBuildEndValid()', () => {
    it('Should return true when build end date is valid and occurs before build start date', (done) => {
      const result = RecallValidator.isBuildEndValid('2017-01-01', '2017-05-01');

      expect(result.isValid).to.be.true;
      expect(result.failureReason).to.equal('');
      done();
    });

    it('Should return true when build end date is valid and build start date is null', (done) => {
      const result = RecallValidator.isBuildEndValid(null, '2017-01-01');

      expect(result.isValid).to.be.true;
      expect(result.failureReason).to.equal('');
      done();
    });

    it('Should return true when build end date is null', (done) => {
      const result = RecallValidator.isBuildEndValid('2017-01-01', null);

      expect(result.isValid).to.be.true;
      expect(result.failureReason).to.equal('');
      done();
    });

    it('Should return false when build end date equals DATE_INVALID', (done) => {
      const result = RecallValidator.isBuildEndValid('2017-05-01', DATE_INVALID);

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Build end has invalid format.');
      done();
    });

    it('Should return false when build end date occurs before build start date', (done) => {
      const result = RecallValidator.isBuildEndValid('2017-05-01', '2017-01-01');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Build end occurs before build start.');
      done();
    });
  });

  describe('isBuildRangeValid()', () => {
    it('Should return true when all build start and end dates are valid', (done) => {
      const buildRange = [
        { start: '2017-05-01', end: '2017-06-01' },
        { start: '2017-03-01', end: '2017-04-01' },
      ];
      const result = RecallValidator.isBuildRangeValid(buildRange, '2017-06-01');

      expect(result.isValid).to.be.true;
      expect(result.failureReason).to.equal('');
      done();
    });

    it('Should return false when build start date is invalid', (done) => {
      const buildRange = [
        { start: '2017-07-01', end: '2017-08-01' },
        { start: '2017-03-01', end: '2017-04-01' },
      ];
      const result = RecallValidator.isBuildRangeValid(buildRange, '2017-06-01');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('Build start occurs after launch date. ');
      done();
    });

    it('Should return false when build end date is invalid', (done) => {
      const buildRange = [
        { start: '2017-05-01', end: '2017-06-01' },
        { start: '2017-03-01', end: '2017-02-01' },
      ];
      const result = RecallValidator.isBuildRangeValid(buildRange, '2017-06-01');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal(' Build end occurs before build start.');
      done();
    });
  });

  describe('areRequiredValuesNotEpty()', () => {
    it('Should return true when all required values are present', (done) => {
      const result = RecallValidator.areRequiredValuesNotEmpty('make', 'concern', 'defect', 'remedy', 'model');

      expect(result.isValid).to.be.true;
      expect(result.failureReason).to.equal('');
      done();
    });

    it('Should return false when make is missing', (done) => {
      const result = RecallValidator.areRequiredValuesNotEmpty(null, 'concern', 'defect', 'remedy', 'model');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('One of required values (make, concern, defect, remedy, model) is empty.');
      done();
    });

    it('Should return false when concern is missing', (done) => {
      const result = RecallValidator.areRequiredValuesNotEmpty('make', null, 'defect', 'remedy', 'model');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('One of required values (make, concern, defect, remedy, model) is empty.');
      done();
    });

    it('Should return false when defect is missing', (done) => {
      const result = RecallValidator.areRequiredValuesNotEmpty('make', 'concern', null, 'remedy', 'model');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('One of required values (make, concern, defect, remedy, model) is empty.');
      done();
    });

    it('Should return false when remedy is missing', (done) => {
      const result = RecallValidator.areRequiredValuesNotEmpty('make', 'concern', 'defect', null, 'model');

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('One of required values (make, concern, defect, remedy, model) is empty.');
      done();
    });

    it('Should return false when model is missing', (done) => {
      const result = RecallValidator.areRequiredValuesNotEmpty('make', 'concern', 'defect', 'remedy', null);

      expect(result.isValid).to.be.false;
      expect(result.failureReason).to.equal('One of required values (make, concern, defect, remedy, model) is empty.');
      done();
    });
  });

  describe('isValid()', () => {
    it('Should return true when all values are valid', (done) => {
      const isValid = RecallValidator.isValid('2017-06-01', 'RM/95/003', 'make', 'concern', 'defect', 'remedy', '200', 'model', [{ start: '2017-05-01', end: '2017-06-01' }]);

      expect(isValid).to.be.true;
      done();
    });

    it('Should return false when one of the values is ivalid', (done) => {
      const isValid = RecallValidator.isValid('2017-06-01', 'INVALID', 'make', 'concern', 'defect', 'remedy', '200', 'model', [{ start: '2017-05-01', end: '2017-06-01' }]);

      expect(isValid).to.be.false;
      done();
    });
  });
});
