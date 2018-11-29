
const assert = require('assert');
const sinon = require('sinon');
const ManufactureYearValidator = require('../../validators/manufactureYear');

const PAST_YEAR = '2017';
const CURRENT_YEAR = '2018';
const FUTURE_YEAR = '2019';

let validator = new ManufactureYearValidator();

describe('Vehicle year validator', () => {
  before(() => {
    validator = new ManufactureYearValidator();
    this.currentYearStub = sinon.stub(ManufactureYearValidator, 'getCurrentYear').returns(CURRENT_YEAR);
  });
  after(() => {
    this.currentYearStub.reset();
  });

  describe('isValid()', () => {
    it('should not accept empty strings', () => {
      assert.equal(validator.isValid(''), false);
      assert.equal(validator.getErrorMessage(), validator.EMPTY_YEAR_MSG);
    });
    it('should not accept null values', () => {
      assert.equal(validator.isValid(null), false);
      assert.equal(validator.getErrorMessage(), validator.EMPTY_YEAR_MSG);
    });
    it('should accept years in the past', () => {
      assert.equal(validator.isValid(PAST_YEAR), true);
    });
    it('should accept the current year', () => {
      assert.equal(validator.isValid(CURRENT_YEAR), true);
    });
    it('should not accept years in the future', () => {
      assert.equal(validator.isValid(FUTURE_YEAR), false);
      assert.equal(validator.getErrorMessage(), validator.IN_THE_FUTURE_MSG);
    });
    it('should not accept less than 4 digits', () => {
      assert.equal(validator.isValid('123'), false);
      assert.equal(validator.getErrorMessage(), validator.FOUR_DIGITS_MSG);
    });
    it('should not accept more than 4 digits', () => {
      assert.equal(validator.isValid('12345'), false);
      assert.equal(validator.getErrorMessage(), validator.FOUR_DIGITS_MSG);
    });
    it('should not accept non-digits', () => {
      assert.equal(validator.isValid('a123'), false);
      assert.equal(validator.getErrorMessage(), validator.DIGITS_ONLY_MSG);
    });
  });
  describe('getErrorMessage()', () => {
    it('Should not return an empty message', () => {
      assert.equal(validator.getErrorMessage().length > 0, true);
    });
  });
});
