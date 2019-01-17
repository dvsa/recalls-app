const sinon = require('sinon');
const { expect } = require('chai');
const RecallType = require('cvr-common/src/model/recallTypeEnum');
const RecallsRepository = require('../../repositories/recalls');
const ModelsResource = require('../../resources/models');

const TYPE = RecallType.vehicle;
const MAKE = 'Toyota';

const MODEL_YARIS = 'Yaris';
const MODEL_COROLLA = 'Corolla';
const MODEL_CELICA = 'Celica';

function getAllModelsByTypeAndMake(type, make, callback) {
  callback(null, {
    Item: { models: [MODEL_CELICA, MODEL_COROLLA, MODEL_YARIS] },
  });
}

function getAllModels(callback) {
  callback(null, {
    Items: [
      { type: 'equipment-APEC', models: [MODEL_YARIS] },
      { type: 'vehicle-TOYOTA', models: [MODEL_CELICA, MODEL_COROLLA, MODEL_YARIS] },
    ],
  });
}

function getAllModelsByTypeAndMakeNoResults(type, make, callback) {
  callback(null, {
    Item: {
      models: [],
    },
  });
}

function getEmptyResponse(models, callback) {
  callback(null, null);
}

function getAllModelsByTypeAndMakeWithError(type, make, callback) {
  callback(new Error('Error'), null);
}

function updateModelsWithError(models, callback) {
  callback(new Error('Error'), null);
}

describe('ModelsResource', () => {
  describe('getAllModelsByTypeAndMake() method', () => {
    it('Should return list of models', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllModelsByTypeAndMake').callsFake(getAllModelsByTypeAndMake);

      const modelsResource = new ModelsResource(recallsRepository);
      modelsResource.getAllModelsByTypeAndMake(TYPE, MAKE, (err, data) => {
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(3);
        expect(data).to.include(MODEL_CELICA);
        expect(data).to.include(MODEL_COROLLA);
        expect(data).to.include(MODEL_YARIS);
        done();
      });
    });

    it('Should return an empty list of models if no results were found', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllModelsByTypeAndMake').callsFake(getAllModelsByTypeAndMakeNoResults);

      const modelsResource = new ModelsResource(recallsRepository);
      modelsResource.getAllModelsByTypeAndMake(TYPE, MAKE, (err, data) => {
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(0);
        done();
      });
    });

    it('Should return error when RecallsRepository returns an error', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllModelsByTypeAndMake').callsFake(getAllModelsByTypeAndMakeWithError);

      const modelsResource = new ModelsResource(recallsRepository);
      modelsResource.getAllModelsByTypeAndMake(TYPE, MAKE, (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err.message).to.equal('Error');
        expect(getAllModelsByTypeAndMakeWithError).to.throw(Error);
        done();
      });
    });
  });

  describe('getAllModels() method', () => {
    it('Should return data from database mapped to list of Makes objects', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllModels').callsFake(getAllModels);

      const makesResource = new ModelsResource(recallsRepository);
      makesResource.getAllModels((err, data) => {
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(2);

        expect(data[0].models).to.nested.include(MODEL_YARIS);
        expect(data[0].models).to.not.nested.include(MODEL_COROLLA);
        expect(data[1].models).to.nested.include(MODEL_COROLLA);
        done();
      });
    });
  });

  describe('updateModels() method', () => {
    it('Should return error when RecallsRepository returns an error', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'updateModels').callsFake(updateModelsWithError);

      const modelsResource = new ModelsResource(recallsRepository);
      modelsResource.updateModels([{}], (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err.message).to.equal('Error');
        expect(updateModelsWithError).to.throw(Error);
        done();
      });
    });

    it('Should return an empty response when models will be updated', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'updateModels').callsFake(getEmptyResponse);

      const modelsResource = new ModelsResource(recallsRepository);
      modelsResource.updateModels([{}], (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err).to.be.an('null');
        done();
      });
    });
  });
});
