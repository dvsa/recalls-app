
const assert = require('assert');
const vehicleMake = require('../../validators/vehicleMake');

describe('Vehicle make validator', () => {
  describe('isValid()', () => {
    it('should not accept empty strings', () => {
      assert.equal(vehicleMake.isValid(''), false);
    });
    it('should not accept null values', () => {
      assert.equal(vehicleMake.isValid(null), false);
    });
    it('should accept non-empty strings', () => {
      assert.equal(vehicleMake.isValid('random'), true);
    });
  });
  describe('getErrorMessage()', () => {
    it('Should not return an empty message', () => {
      assert.equal(vehicleMake.getErrorMessage().length > 0, true);
    });
  });
});
