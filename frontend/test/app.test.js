const assert = require('assert');
const app = require('../app.js');

describe('App', () => {
  describe('set()', () => {
    it('should set view engine to be nunjucks', () => {
      assert.equal(app.get('view engine'), 'nunjucks');
    });
  });
});
