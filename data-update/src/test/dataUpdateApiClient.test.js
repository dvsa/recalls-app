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
const ERROR = 'Fake error';
const RECALLS = [new RecallDbRecordDto('launchDate', 'recNumber')];

const FIRST_MAKE = new SerializableMakeDbRecordDto('type', ['make1']);
const MAKES_API_RESPONSE = [FIRST_MAKE];
const MAKES = [new MakeDbRecordDto(FIRST_MAKE.type, new Set(FIRST_MAKE.makes))];

const FIRST_MODEL = new SerializableModelDbRecordDto('vehicle-BMW', ['E90']);
const MODELS_API_RESPONSE = [FIRST_MODEL];
const MODELS = [new ModelDbRecordDto(FIRST_MODEL.type_make, new Set(FIRST_MODEL.models))];

describe('DataUpdateApiClient', () => {
  before(() => {
    this.get = sinon.stub(request, 'get');
    this.patch = sinon.stub(request, 'patch');
  });
  after(() => {
    this.get.restore();
    this.patch = this.patch.restore();
  });
  describe('updateRecalls()', () => {
    it('An error is raised when API request fails', (done) => {
      this.patch.yields(ERROR);

      dataUpdateApiClient.updateRecalls(RECALLS, (err, res) => {
        expect(err).to.equal(ERROR);
        expect(res).to.equal(undefined);
        done();
      });
    });
    it('A response is returned when API request succeeds', (done) => {
      this.patch.yields(null, RESULTS);

      dataUpdateApiClient.updateRecalls(RECALLS, (err, res) => {
        expect(err).to.equal(null);
        expect(res).to.equal(RESULTS);
        done();
      });
    });
  });
  describe('updateMakes()', () => {
    it('An error is raised when API request fails', (done) => {
      this.patch.yields(ERROR);

      dataUpdateApiClient.updateMakes(MAKES, (err, res) => {
        expect(err).to.equal(ERROR);
        expect(res).to.equal(undefined);
        done();
      });
    });
    it('A response is returned when API request succeeds', (done) => {
      this.patch.yields(null, RESULTS);

      dataUpdateApiClient.updateMakes(MAKES, (err, res) => {
        expect(err).to.equal(null);
        expect(res).to.equal(RESULTS);
        done();
      });
    });
  });
  describe('updateModels()', () => {
    it('An error is raised when API request fails', (done) => {
      this.patch.yields(ERROR);

      dataUpdateApiClient.updateModels(MODELS, (err, res) => {
        expect(err).to.equal(ERROR);
        expect(res).to.equal(undefined);
        done();
      });
    });
    it('A response is returned when API request succeeds', (done) => {
      this.patch.yields(null, RESULTS);

      dataUpdateApiClient.updateModels(MODELS, (err, res) => {
        expect(err).to.equal(null);
        expect(res).to.equal(RESULTS);
        done();
      });
    });
  });
  describe('getAllRecalls()', () => {
    it('Maps response to recall objects', (done) => {
      this.get.yields(null, {}, JSON.stringify(RECALLS));
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
      const recallsBackendApiKey = 'keykeykeykey';
      sinon.stub(envVariables, 'lambdaName').value(lambdaName);
      sinon.stub(envVariables, 'recallsBackendApiKey').value(recallsBackendApiKey);

      const headers = dataUpdateApiClient.getRequestHeaders();

      expect(headers).to.be.an('object');
      expect(headers[requestHeaders.PARENT_REQUEST_ID]).to.be.a('string');
      expect(headers[requestHeaders.PARENT_REQUEST_ID]).to.have.lengthOf(40);
      expect(headers[requestHeaders.CALLER_NAME]).to.equal(lambdaName);
      expect(headers[requestHeaders.API_KEY]).to.equal(recallsBackendApiKey);
      done();
    });
  });
});
