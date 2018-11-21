
const assert = require('assert');
const vehicleModel = require('../../validators/vehicleModel');

describe('Vehicle model validator', () => {
  describe('isValid()', () => {
    it('should not accept empty strings', () => {
      assert.equal(vehicleModel.isValid(''), false);
    });
    it('should not accept null values', () => {
      assert.equal(vehicleModel.isValid(null), false);
    });
    it('should accept non-empty strings', () => {
      assert.equal(vehicleModel.isValid('random'), true);
    });
  });
  describe('getErrorMessage()', () => {
    it('Should not return an empty message', () => {
      assert.equal(vehicleModel.getErrorMessage().length > 0, true);
    });
  });
});
