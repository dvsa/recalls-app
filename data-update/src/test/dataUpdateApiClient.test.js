const request = require('request');
const sinon = require('sinon');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');
const MakeDbRecordDto = require('cvr-common/src/dto/makeDbRecord');
const SerializableMakeDbRecordDto = require('cvr-common/src/dto/serializableMakeDbRecord');
const ModelDbRecordDto = require('cvr-common/src/dto/modelDbRecord');
const SerializableModelDbRecordDto = require('cvr-common/src/dto/serializableModelDbRecord');
const requestHeaders = require('cvr-common/src/constants/requestHeaders');
const { expect } = require('chai');
const envVariables = require('../config/environmentVariables');
const dataUpdateApiClient = require('../dataUpdateApiClient');

const RESULTS = [{ fakeResult: 'result' }];
const MANY_RESULTS = [{ fakeResult: 'result' }, { fakeResult: 'result2' }];
const ERROR = 'Fake error';
const RECALLS = [new RecallDbRecordDto('launchDate', 'recNumber')];
const MANY_RECALLS = [new RecallDbRecordDto('launchDate', 'recNumber'),
  new RecallDbRecordDto('launchDate2', 'recNumber2')];
const SECOND_RECALLS = [new RecallDbRecordDto('launchDate2', 'recNumber2')];
const RECALLS_API_RESPONSE = { items: RECALLS };
const FIRST_PAGINATION_RECALLS_API_RESPONSE = { items: RECALLS, lastEvaluatedKey: 10 };
const SECOND_PAGINATION_RECALLS_API_RESPONSE = { items: SECOND_RECALLS };

const FIRST_MAKE = new SerializableMakeDbRecordDto('type', ['make1']);
const SECOND_MAKE = new SerializableMakeDbRecordDto('type2', ['make2']);
const MAKES_API_RESPONSE = { items: [FIRST_MAKE] };
const MAKES = [new MakeDbRecordDto(FIRST_MAKE.type, new Set(FIRST_MAKE.makes))];
const MANY_MAKES = [new MakeDbRecordDto(FIRST_MAKE.type, new Set(FIRST_MAKE.makes)),
  new MakeDbRecordDto(SECOND_MAKE.type, new Set(SECOND_MAKE.makes))];
const FIRST_PAGINATION_MAKES_API_RESPONSE = { items: [FIRST_MAKE], lastEvaluatedKey: 1 };
const SECOND_PAGINATION_MAKES_API_RESPONSE = { items: [SECOND_MAKE] };

const FIRST_MODEL = new SerializableModelDbRecordDto('vehicle-BMW', ['E90']);
const SECOND_MODEL = new SerializableModelDbRecordDto('vehicle-Audi', ['A6']);
const MODELS_API_RESPONSE = { items: [FIRST_MODEL] };
const MODELS = [new ModelDbRecordDto(FIRST_MODEL.type_make, new Set(FIRST_MODEL.models))];
const MANY_MODELS = [new ModelDbRecordDto(FIRST_MODEL.type_make, new Set(FIRST_MODEL.models)),
  new ModelDbRecordDto(SECOND_MODEL.type_make, new Set(SECOND_MODEL.models))];
const FIRST_PAGINATION_MODELS_API_RESPONSE = { items: [FIRST_MODEL], lastEvaluatedKey: 1 };
const SECOND_PAGINATION_MODELS_API_RESPONSE = { items: [SECOND_MODEL] };

describe('DataUpdateApiClient', () => {
  beforeEach(() => {
    this.get = sinon.stub(request, 'get');
    this.patch = sinon.stub(request, 'patch');
  });
  afterEach(() => {
    this.get.restore();
    this.patch = this.patch.restore();
  });
  describe('updateRecalls()', () => {
    it('An error is raised when API request fails', (done) => {
      this.patch.yields(ERROR);

      dataUpdateApiClient.updateRecalls(RECALLS, (err, res) => {
        expect(err).to.equal(ERROR);
        expect(res).to.deep.equal(undefined);
        done();
      });
    });
    it('A response is returned when API request succeeds', (done) => {
      this.patch.yields(null, RESULTS);

      dataUpdateApiClient.updateRecalls(RECALLS, (err, res) => {
        expect(err).to.equal(null);
        expect(res).to.deep.equal(RESULTS);
        done();
      });
    });
    it('A response is returned when API request succeeds with pagination', (done) => {
      this.patch.yields(null, MANY_RESULTS);

      dataUpdateApiClient.updateRecalls(MANY_RECALLS, (err, res) => {
        expect(err).to.equal(null);
        expect(res).to.deep.equal(MANY_RESULTS);
        done();
      });
    });
  });
  describe('updateMakes()', () => {
    it('An error is raised when API request fails', (done) => {
      this.patch.yields(ERROR);

      dataUpdateApiClient.updateMakes(MAKES, (err, res) => {
        expect(err).to.equal(ERROR);
        expect(res).to.deep.equal(undefined);
        done();
      });
    });
    it('A response is returned when API request succeeds', (done) => {
      this.patch.yields(null, RESULTS);

      dataUpdateApiClient.updateMakes(MAKES, (err, res) => {
        expect(err).to.equal(null);
        expect(res).to.deep.equal(RESULTS);
        done();
      });
    });
    it('A response is returned when API request succeeds with pagination', (done) => {
      this.patch.yields(null, MANY_RESULTS);

      dataUpdateApiClient.updateMakes(MANY_MAKES, (err, res) => {
        expect(err).to.equal(null);
        expect(res).to.deep.equal(MANY_RESULTS);
        done();
      });
    });
  });
  describe('updateModels()', () => {
    it('An error is raised when API request fails', (done) => {
      this.patch.yields(ERROR);

      dataUpdateApiClient.updateModels(MODELS, (err, res) => {
        expect(err).to.equal(ERROR);
        expect(res).to.deep.equal(undefined);
        done();
      });
    });
    it('A response is returned when API request succeeds', (done) => {
      this.patch.yields(null, RESULTS);

      dataUpdateApiClient.updateModels(MODELS, (err, res) => {
        expect(err).to.equal(null);
        expect(res).to.deep.equal(RESULTS);
        done();
      });
    });
    it('A response is returned when API request succeeds with pagination', (done) => {
      this.patch.yields(null, MANY_RESULTS);

      dataUpdateApiClient.updateModels(MANY_MODELS, (err, res) => {
        expect(err).to.equal(null);
        expect(res).to.deep.equal(MANY_RESULTS);
        done();
      });
    });
  });
  describe('getAllRecalls()', () => {
    it('Maps response to recall objects with pagination', (done) => {
      this.get.onFirstCall()
        .yields(null, {}, JSON.stringify(FIRST_PAGINATION_RECALLS_API_RESPONSE));
      this.get.onSecondCall()
        .yields(null, {}, JSON.stringify(SECOND_PAGINATION_RECALLS_API_RESPONSE));
      dataUpdateApiClient.getAllRecalls((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.lengthOf(2);
        expect(res).to.deep.include(RECALLS[0]);
        expect(res).to.deep.include(SECOND_RECALLS[0]);
        done();
      });
    });
    it('Maps response to recall objects', (done) => {
      this.get.yields(null, {}, JSON.stringify(RECALLS_API_RESPONSE));
      dataUpdateApiClient.getAllRecalls((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.lengthOf(1);
        expect(res).to.deep.include(RECALLS[0]);
        done();
      });
    });
    it('Raises an error when API request fails', (done) => {
      this.get.yields(ERROR);
      dataUpdateApiClient.getAllRecalls((err, res) => {
        expect(err).to.equal(ERROR);
        expect(res).to.equal(undefined);
        done();
      });
    });
  });
  describe('getAllMakes()', () => {
    it('Maps response to recall objects with pagination', (done) => {
      this.get.onFirstCall()
        .yields(null, {}, JSON.stringify(FIRST_PAGINATION_MAKES_API_RESPONSE));
      this.get.onSecondCall()
        .yields(null, {}, JSON.stringify(SECOND_PAGINATION_MAKES_API_RESPONSE));
      dataUpdateApiClient.getAllMakes((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.lengthOf(2);
        expect(res[0].type).to.equal(FIRST_MAKE.type);
        expect(res[1].type).to.equal(SECOND_MAKE.type);
        done();
      });
    });
    it('Maps response to recall objects', (done) => {
      this.get.yields(null, {}, JSON.stringify(MAKES_API_RESPONSE));
      dataUpdateApiClient.getAllMakes((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.lengthOf(1);
        expect(res).to.deep.include(MAKES[0]);
        done();
      });
    });
    it('Raises an error when API request fails', (done) => {
      this.get.yields(ERROR);
      dataUpdateApiClient.getAllMakes((err, res) => {
        expect(err).to.equal(ERROR);
        expect(res).to.equal(undefined);
        done();
      });
    });
  });
  describe('getAllModels()', () => {
    it('Maps response to recall objects with pagination', (done) => {
      this.get.onFirstCall()
        .yields(null, {}, JSON.stringify(FIRST_PAGINATION_MODELS_API_RESPONSE));
      this.get.onSecondCall()
        .yields(null, {}, JSON.stringify(SECOND_PAGINATION_MODELS_API_RESPONSE));
      dataUpdateApiClient.getAllModels((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.lengthOf(2);
        expect(res[0].type_make).to.equal(FIRST_MODEL.type_make);
        expect(res[1].type_make).to.equal(SECOND_MODEL.type_make);
        done();
      });
    });
    it('Maps response to recall objects', (done) => {
      this.get.yields(null, {}, JSON.stringify(MODELS_API_RESPONSE));
      dataUpdateApiClient.getAllModels((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.lengthOf(1);
        expect(res).to.deep.include(MODELS[0]);
        done();
      });
    });
    it('Raises an error when API request fails', (done) => {
      this.get.yields(ERROR);
      dataUpdateApiClient.getAllModels((err, res) => {
        expect(err).to.equal(ERROR);
        expect(res).to.equal(undefined);
        done();
      });
    });
  });
  describe('getRequestHeaders()  ', () => {
    it('Should return correct request headers object', (done) => {
      const lambdaName = 'cvr-data-update-lambda';
      sinon.stub(envVariables, 'lambdaName').value(lambdaName);

      const headers = dataUpdateApiClient.getRequestHeaders();

      expect(headers).to.be.an('object');
      expect(headers[requestHeaders.PARENT_REQUEST_ID]).to.be.a('string');
      expect(headers[requestHeaders.PARENT_REQUEST_ID]).to.have.lengthOf(40);
      expect(headers[requestHeaders.CALLER_NAME]).to.equal(lambdaName);
      done();
    });
  });
});
