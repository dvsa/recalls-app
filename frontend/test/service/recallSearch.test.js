const sinon = require('sinon');
const expect = require('chai').expect;
const should = require('chai').should();
const httpContext = require('express-http-context');
const request = require('cvr-common/src/helpers/HttpRequest');
const RecallDto = require('cvr-common/src/dto/recall');
const requestHeaders = require('cvr-common/src/constants/requestHeaders');
const sessionStorageConstants = require('cvr-common/src/constants/sessionStorageKeys');
const recallSearch = require('../../service/recallSearch');
const envVariables = require('../../config/environmentVariables');

const TYPE_VEHICLE = 'vehicle';
const MAKE_LAND_ROVER = 'LAND ROVER';
const MODEL_DISCOVERY = 'DISCOVERY';
const YEAR = '2018';
const API_ERROR_MESSAGE = 'An error has occurred during request';
const FIRST_RESULT = 'result 1';
const SECOND_RESULT = 'result 2';
const RESULTS = [FIRST_RESULT, SECOND_RESULT];
const FAKE_HEADER_REQUEST_ID_KEY = 'fake request id key header';
const FAKE_HEADER_FUNCTION_NAME = 'fake function name header';
const FAKE_API_KEY = 'apikeyapikeyapikey';

function mapRecallsToDtoReturns(mappedRecalls) {
  return sinon.stub(recallSearch, 'mapRecallsToDto').returns(mappedRecalls);
}

function createRecallDto(make) {
  return new RecallDto(
    make,
    'Model',
    'Number',
    'Description',
    '2018-01-02',
    'Concern',
    'Remedy',
    'Affected number',
    [{ start: '2010-04-19', end: '2018-05-20' }],
  );
}

function createResponseRecallDto(recallDto) {
  return new RecallDto(
    recallDto.make,
    recallDto.model,
    recallDto.recallNumber,
    recallDto.defectDescription,
    '02-01-2018',
    recallDto.concern,
    recallDto.remedy,
    recallDto.affectedVehiclesNumber,
    recallDto.buildRange,
  );
}

function fakeGet(key) {
  if (key === sessionStorageConstants.REQUEST_ID_KEY) {
    return FAKE_HEADER_REQUEST_ID_KEY;
  }
  if (key === sessionStorageConstants.FUNCTION_NAME) {
    return FAKE_HEADER_FUNCTION_NAME;
  }
  return null;
}

describe('RecallSearch', () => {
  before(() => {
    this.get = sinon.stub(request, 'get');
  });
  after(() => {
    this.get.restore();
  });

  describe('fetchAllMakes()  ', () => {
    it('Should parse a JSON response from the API', (done) => {
      // When an API request returns a JSON string
      this.get.yields(null, {}, JSON.stringify(RESULTS));

      // RecallSearch converts it into an array
      recallSearch.fetchAllMakes('vehicle', (err, makes) => {
        expect(makes).to.be.an('array');
        expect(makes).to.include(FIRST_RESULT);
        expect(makes).to.include(SECOND_RESULT);
        done();
      });
    });

    it('Should report errors that occur during API requests', (done) => {
      // When an API request returns an error
      this.get.yields(API_ERROR_MESSAGE, {}, JSON.stringify(RESULTS));

      // RecallSearch passes it in the callback
      recallSearch.fetchAllMakes('vehicle', (err, makes) => {
        expect(err).to.include(API_ERROR_MESSAGE);
        should.not.exist(makes);
        done();
      });
    });
  });

  describe('byMakeAndModel()', () => {
    before(() => {
      this.mapRecallsToDto = mapRecallsToDtoReturns(RESULTS);
    });
    after(() => {
      this.mapRecallsToDto.restore();
    });
    it('Should parse a JSON response from the API', (done) => {
      this.get.yields(null, {}, JSON.stringify(RESULTS));

      recallSearch.byMakeModelAndYear(TYPE_VEHICLE, MAKE_LAND_ROVER, MODEL_DISCOVERY, YEAR,
        (err, recalls) => {
          expect(recalls).to.be.an('array');
          expect(recalls).to.include(FIRST_RESULT);
          expect(recalls).to.include(SECOND_RESULT);
          done();
        });
    });
    it('Should report errors that occur during API requests', (done) => {
      this.get.yields(API_ERROR_MESSAGE, {}, JSON.stringify(RESULTS));

      recallSearch.byMakeModelAndYear(TYPE_VEHICLE, MAKE_LAND_ROVER, MODEL_DISCOVERY, YEAR,
        (err, recalls) => {
          expect(err).to.include(API_ERROR_MESSAGE);
          should.not.exist(recalls);
          done();
        });
    });
  });

  describe('mapRecallsToDto()  ', () => {
    it('Should map an API response to Recall DTOs', (done) => {
      const citroenRecall = createRecallDto('CITROEN');
      const landRoverRecall = createRecallDto('LAND ROVER');
      const recallDtos = [citroenRecall, landRoverRecall];
      const recallsAsStringFromApi = JSON.stringify(recallDtos);

      const mappedRecalls = recallSearch.mapRecallsToDto(recallsAsStringFromApi);

      expect(mappedRecalls).to.be.an('array');
      expect(mappedRecalls).to.have.lengthOf(2);
      expect(mappedRecalls).to.deep.include(createResponseRecallDto(citroenRecall));
      expect(mappedRecalls).to.deep.include(createResponseRecallDto(landRoverRecall));
      done();
    });
  });

  describe('getRequestHeaders()  ', () => {
    before(() => {
      this.httpContext = sinon.stub(httpContext, 'get').callsFake(fakeGet);
      sinon.stub(envVariables, 'recallsBackendApiKey').value(FAKE_API_KEY);
    });
    after(() => {
      this.httpContext.restore();
    });

    it('Should return correct request headers object', (done) => {
      const headers = recallSearch.getRequestHeaders();

      expect(headers).to.be.an('object');
      expect(headers[requestHeaders.PARENT_REQUEST_ID]).to.equal(FAKE_HEADER_REQUEST_ID_KEY);
      expect(headers[requestHeaders.CALLER_NAME]).to.equal(FAKE_HEADER_FUNCTION_NAME);
      expect(headers[requestHeaders.API_KEY]).to.equal(FAKE_API_KEY);
      done();
    });
  });
});
