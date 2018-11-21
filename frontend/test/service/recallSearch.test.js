const sinon = require('sinon');
const expect = require('chai').expect;
const should = require('chai').should();
const request = require('request');
const RecallDto = require('cvr-common/dto/recall');
const recallSearch = require('../../service/recallSearch');

const TYPE_VEHICLE = 'vehicle';
const MAKE_LAND_ROVER = 'LAND ROVER';
const MODEL_DISCOVERY = 'DISCOVERY';
const API_ERROR_MESSAGE = 'An error has occurred during request';
const FIRST_RESULT = 'result 1';
const SECOND_RESULT = 'result 2';
const RESULTS = [FIRST_RESULT, SECOND_RESULT];

function mapRecallsToDtoReturns(mappedRecalls) {
  return sinon.stub(recallSearch, 'mapRecallsToDto').returns(mappedRecalls);
}

function createRecallDto(make) {
  const recallDto = new RecallDto();
  recallDto.make = make;
  recallDto.model = 'Model';
  recallDto.recallNumber = 'Number';
  recallDto.defectDescription = 'Description';
  recallDto.launchDate = 'Launch date';
  recallDto.concern = 'Concern';
  recallDto.remedy = 'Remedy';
  recallDto.affectedVehiclesNumber = 'Affected number';
  return recallDto;
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

      recallSearch.byMakeAndModel(TYPE_VEHICLE, MAKE_LAND_ROVER, MODEL_DISCOVERY,
        (err, recalls) => {
          expect(recalls).to.be.an('array');
          expect(recalls).to.include(FIRST_RESULT);
          expect(recalls).to.include(SECOND_RESULT);
          done();
        });
    });
    it('Should report errors that occur during API requests', (done) => {
      this.get.yields(API_ERROR_MESSAGE, {}, JSON.stringify(RESULTS));

      recallSearch.byMakeAndModel(TYPE_VEHICLE, MAKE_LAND_ROVER, MODEL_DISCOVERY,
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
      expect(mappedRecalls).to.deep.include(citroenRecall);
      expect(mappedRecalls).to.deep.include(landRoverRecall);
      done();
    });
  });
});
