const sinon = require('sinon');
const { expect } = require('chai');
const RecallType = require('cvr-common/model/recallTypeEnum');
const RecallsRepository = require('../../repositories/recalls');
const ModelsResource = require('../../resources/models');

const TYPE = RecallType.vehicle;
const MAKE = 'Toyota';

const MODEL_YARIS = 'Yaris';
const MODEL_COROLLA = 'Corolla';
const MODEL_CELICA = 'Celica';

function getAllModels(type, make, callback) {
  callback(null, {
    Item: { models: [MODEL_CELICA, MODEL_COROLLA, MODEL_YARIS] },
  });
}

function getAllModelsNoResults(type, make, callback) {
  callback(null, {
    Item: {
      models: [],
    },
  });
}

function getAllModelsWithError(type, make, callback) {
  callback(new Error('Error'), null);
}

describe('ModelsResource', () => {
  describe('getAllModels() method', () => {
    it('Should return list of models', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllModels').callsFake(getAllModels);

      const modelsResource = new ModelsResource(recallsRepository);
      modelsResource.getAllModels(TYPE, MAKE, (err, data) => {
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
      sinon.stub(recallsRepository, 'getAllModels').callsFake(getAllModelsNoResults);

      const modelsResource = new ModelsResource(recallsRepository);
      modelsResource.getAllModels(TYPE, MAKE, (err, data) => {
        expect(data).to.be.an('array');
        expect(data).to.have.lengthOf(0);
        done();
      });
    });

    it('Should return error when RecallsRepository returns an error', (done) => {
      const recallsRepository = new RecallsRepository();
      sinon.stub(recallsRepository, 'getAllModels').callsFake(getAllModelsWithError);

      const modelsResource = new ModelsResource(recallsRepository);
      modelsResource.getAllModels(TYPE, MAKE, (err, data) => {
        expect(data).to.be.an('undefined');
        expect(err.message).to.equal('Error');
        expect(getAllModelsWithError).to.throw(Error);
        done();
      });
    });
  });
});
