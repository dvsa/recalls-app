
const assert = require('assert');
const recallType = require('../../validators/recallType');

describe('Recall type validator', () => {
  describe('isValid()', () => {
    it('should not accept empty strings', () => {
      assert.equal(recallType.isValid(''), false);
    });
    it('should not accept null values', () => {
      assert.equal(recallType.isValid(null), false);
    });
    it('should not accept random strings', () => {
      assert.equal(recallType.isValid('random'), false);
    });
    it("should accept 'vehicle'", () => {
      assert.equal(recallType.isValid('vehicle'), true);
    });
    it("should accept 'equipment'", () => {
      assert.equal(recallType.isValid('equipment'), true);
    });
  });
  describe('getErrorMessage()', () => {
    it('Should not return an empty message', () => {
      assert.equal(recallType.getErrorMessage().length > 0, true);
    });
  });
});
