const sinon = require('sinon');
const expect = require('chai').expect;
const should = require('chai').should();
const request = require('request');
const recallSearch = require('../../service/recallSearch');

const MAKE_BMW = 'BMW';
const MAKE_LAND_ROVER = 'LAND ROVER';
const API_ERROR_MESSAGE = 'An error occurred during request';
const RESPONSE_BODY = [MAKE_BMW, MAKE_LAND_ROVER];

describe('RecallSearch', () => {
  describe('fetchAllMakes()  ', () => {
    this.get = sinon.stub(request, 'get');

    it('Should parse a JSON response from the API', (done) => {
      // When an API request returns a JSON string
      this.get.yields(null, {}, JSON.stringify(RESPONSE_BODY));

      // RecallSearch converts it into an array
      recallSearch.fetchAllMakes('vehicle', (err, makes) => {
        expect(makes).to.be.an('array');
        expect(makes).to.include(MAKE_BMW);
        expect(makes).to.include(MAKE_LAND_ROVER);
        done();
      });
    });

    it('Should report errors that occur during API requests', (done) => {
      // When an API request returns an error
      this.get.yields(API_ERROR_MESSAGE, {}, JSON.stringify(RESPONSE_BODY));

      // RecallSearch passes it in the callback
      recallSearch.fetchAllMakes('vehicle', (err, makes) => {
        expect(err).to.include(API_ERROR_MESSAGE);
        should.not.exist(makes);
        done();
      });
    });
  });
});
