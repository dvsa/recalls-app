const fs = require('fs');
const sinon = require('sinon');
const { expect } = require('chai');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');
const MakeDbRecordDto = require('cvr-common/src/dto/makeDbRecord');
const ModelDbRecordDto = require('cvr-common/src/dto/modelDbRecord');
const recallDataProcessor = require('../recallDataProcessor');
const dataUpdateApiClient = require('../dataUpdateApiClient');
const S3BucketObjectProperties = require('../dto/s3BucketObjectProperties');
const RecallsMakesModels = require('../dto/recallsMakesModels');
const envVariables = require('../config/environmentVariables');

let sandbox;
const MAKE_TOYOTA = 'Toyota';
const MAKE_BMW = 'BMW';
const MODEL_COROLLA = 'Corolla';
const MODEL_E90 = 'E90';
const FIRST_RECALL = new RecallDbRecordDto('01/01/2015', 'R/2015/01', MAKE_TOYOTA, 'concern', 'defect', 'remedy', '10', MODEL_COROLLA, null, null, '01/01/2014', '01/01/2015');
const SECOND_RECALL = new RecallDbRecordDto('01/01/2016', 'R/2016/01', MAKE_BMW, 'concern', 'defect', 'remedy', '10', MODEL_E90, null, null, '01/01/2014', '01/01/2015');
const THIRD_RECALL = new RecallDbRecordDto('01/01/2016', 'RCOMP/2222/01', 'Equipment make', 'concern', 'defect', 'remedy', '100', 'Equipment model');
const FIRST_RECALL_INVALID = new RecallDbRecordDto(null, 'R/2015/01', MAKE_TOYOTA, 'concern', 'defect', 'remedy', '10', MODEL_COROLLA, null, null, '01/01/2014', '01/01/2015');
const INVALID_RECALL = new RecallDbRecordDto(null, 'R/2012/01', 'make', 'concern', 'defect', 'remedy', '100', 'model');
const ERROR = 'An error occurred';
const s3CopyObjectResult = { CopyObjectResult: 'result' };

function createS3Mock() {
  const s3 = {};
  s3.getObject = (bucketData, callback) => {
    callback(null, { Body: 'csv' });
  };
  s3.copyObject = (data, callback) => {
    callback(null, s3CopyObjectResult);
  };
  return s3;
}

function createS3MockWithEmptyBody() {
  const s3 = {};
  s3.getObject = (bucketData, callback) => {
    callback(null, { Body: null });
  };
  return s3;
}

function createS3MockReturnsError() {
  const s3 = {};
  s3.getObject = (bucketData, callback) => {
    callback(new Error('I\'m not working'));
  };
  return s3;
}

function getAllRecallsReturns(error, recalls) {
  return sinon.stub(dataUpdateApiClient, 'getAllRecalls').yields(error, recalls);
}

function getAllModelsReturns(error, models) {
  return sinon.stub(dataUpdateApiClient, 'getAllModels').yields(error, models);
}

function getAllMakesReturns(error, makes) {
  return sinon.stub(dataUpdateApiClient, 'getAllMakes').yields(error, makes);
}

function mockApiMethodReturnsError(sinonSandbox, method, error) {
  sinonSandbox.stub(dataUpdateApiClient, method).yields(error);
  return sinonSandbox;
}

const s3Properties = new S3BucketObjectProperties(createS3Mock(), 'srcBucket', 'srcKey');

describe('RecallDataProcessor', () => {
  describe('download() method', () => {
    it('should return callback with data if getObject returns data', () => {
      recallDataProcessor.download(createS3Mock(), 'srcBucket', 'srcKey', (err, s3Prop, data) => {
        expect(data).to.be.a('string');
        expect(data).to.equal('csv');
      });
    });

    it('should return callback with error if getObject returns error', () => {
      recallDataProcessor.download(createS3MockReturnsError(), 'srcBucket', 'srcKey', (err, s3Prop, data) => {
        expect(data).to.equal(undefined);
        expect(err).to.be.an('Error');
        expect(err.message).to.equal('I\'m not working');
      });
    });

    it('should return callback with error if getObject doesn\'t return data', () => {
      recallDataProcessor.download(createS3MockWithEmptyBody(), 'srcBucket', 'srcKey', (err, s3Prop, data) => {
        expect(data).to.equal(undefined);
        expect(err).to.be.an('Error');
        expect(err.message).to.equal('Downloaded CSV file is empty');
      });
    });
  });

  describe('parse() method', () => {
    it('should parse CSV data', () => {
      const data = fs.readFileSync(`${__dirname}/data/testData.csv`);
      const make = 'MERCEDES BENZ';
      const model = 'SPRINTER';
      const type = 'vehicle';
      const recallNumber = 'R/2010/184';

      recallDataProcessor.parse(s3Properties, data, (err, s3Prop, recalls) => {
        expect(recalls).to.have.lengthOf(3);

        const firstRecall = recalls.values().next().value;
        expect(firstRecall.make).to.equal(make);
        expect(firstRecall.model).to.equal(model);
        expect(firstRecall.type).to.equal(type);
        expect(firstRecall.make_model_recall_number).to.equal(`${make}-${model}-${recallNumber}`);
        expect(firstRecall.type_make_model).to.equal(`${type}-${make}-${model}`);
        expect(firstRecall.launch_date).to.equal('2006-06-26');
        expect(firstRecall.recall_number).to.equal(recallNumber);
        expect(firstRecall.concern).to.equal('SEAT BELT MAY BECOME INSECURE');
        expect(firstRecall.defect).to.equal('Some defect');
        expect(firstRecall.remedy).to.equal('Short remedy');
        expect(firstRecall.vehicle_number).to.equal('1');
      });
    });

    it('should raise an error if the data is not buffered', () => {
      const data = 'unbuffered string';
      recallDataProcessor.parse(s3Properties, data, (err) => {
        expect(err).to.be.an('Error');
        expect(err.message).to.equal(recallDataProcessor.bufferError);
      });
    });

    it('should raise an error if the buffered data is empty', () => {
      const data = Buffer.from('');
      recallDataProcessor.parse(s3Properties, data, (err) => {
        expect(err).to.be.an('Error');
        expect(err.message).to.equal(recallDataProcessor.noDataError);
      });
    });
  });

  describe('compare() method', () => {
    const firstModelRecord = new ModelDbRecordDto(`vehicle-${FIRST_RECALL.make}`, new Set([FIRST_RECALL.model]));
    const secondModelRecord = new ModelDbRecordDto(`vehicle-${SECOND_RECALL.make}`, new Set([SECOND_RECALL.model]));
    const thirdModelRecord = new ModelDbRecordDto(`equipment-${THIRD_RECALL.make}`, new Set([THIRD_RECALL.model]));

    const firstMakeRecord = new MakeDbRecordDto('vehicle', new Set([FIRST_RECALL.make]));
    const secondMakeRecord = new MakeDbRecordDto('vehicle', new Set([SECOND_RECALL.make]));
    const thirdMakeRecord = new MakeDbRecordDto('equipment', new Set([THIRD_RECALL.make]));

    afterEach(() => {
      this.getAllRecalls.restore();
      this.getAllMakes.restore();
      this.getAllModels.restore();
    });

    it('Returns arrays of modified recalls, models and makes', (done) => {
      this.getAllRecalls = getAllRecallsReturns(null, [FIRST_RECALL]);
      this.getAllModels = getAllModelsReturns(null, [firstModelRecord]);
      this.getAllMakes = getAllMakesReturns(null, [firstMakeRecord]);

      const currentRecalls = new Map();
      currentRecalls.set(FIRST_RECALL.make_model_recall_number, FIRST_RECALL);
      currentRecalls.set(SECOND_RECALL.make_model_recall_number, SECOND_RECALL);

      recallDataProcessor.compare(s3Properties, currentRecalls,
        (err, s3Prop, modifiedEntries) => {
          expect(modifiedEntries.recalls).to.be.an('array');
          expect(modifiedEntries.recalls).to.have.lengthOf(1);
          expect(modifiedEntries.recalls).to.contain(SECOND_RECALL);
          expect(modifiedEntries.makes).to.be.an('array');
          expect(modifiedEntries.makes[0].makes).to.deep.include(SECOND_RECALL.make);
          expect(modifiedEntries.models).to.be.an('array');
          expect(modifiedEntries.models[0].models).to.deep.include(SECOND_RECALL.model);
          done();
        });
    });
    it('Returns arrays of deleted recalls, models and makes', (done) => {
      this.getAllRecalls = getAllRecallsReturns(null, [FIRST_RECALL, SECOND_RECALL, THIRD_RECALL]);
      this.getAllModels = getAllModelsReturns(null, [
        firstModelRecord, secondModelRecord, thirdModelRecord,
      ]);
      this.getAllMakes = getAllMakesReturns(null, [
        firstMakeRecord, secondMakeRecord, thirdMakeRecord,
      ]);

      const currentRecalls = new Map();
      currentRecalls.set(FIRST_RECALL.make_model_recall_number, FIRST_RECALL);
      currentRecalls.set(SECOND_RECALL.make_model_recall_number, SECOND_RECALL);

      recallDataProcessor.compare(s3Properties, currentRecalls,
        (err, s3Prop, modifiedEntries, deletedEntries) => {
          expect(deletedEntries.recalls).to.be.an('array');
          expect(deletedEntries.recalls).to.have.lengthOf(1);
          expect(deletedEntries.recalls).to.contain(THIRD_RECALL.make_model_recall_number);
          expect(deletedEntries.makes).to.be.an('array');
          expect(deletedEntries.makes).to.include(THIRD_RECALL.type);
          expect(deletedEntries.models).to.be.an('array');
          expect(deletedEntries.models).to.include(`${THIRD_RECALL.type}-${THIRD_RECALL.make}`);
          done();
        });
    });
    it('Returns modified recalls even if it was unable to fetch previous makes or models', (done) => {
      const currentRecalls = new Map();
      this.getAllRecalls = getAllRecallsReturns(null, [FIRST_RECALL]);
      this.getAllModels = getAllModelsReturns(ERROR);
      this.getAllMakes = getAllMakesReturns(ERROR);

      currentRecalls.set(FIRST_RECALL.make_model_recall_number, FIRST_RECALL);
      currentRecalls.set(SECOND_RECALL.make_model_recall_number, SECOND_RECALL);

      recallDataProcessor.compare(s3Properties, currentRecalls,
        (err, s3Prop, modifiedEntries) => {
          expect(modifiedEntries.recalls).to.be.an('array');
          expect(modifiedEntries.recalls).to.have.lengthOf(1);
          expect(modifiedEntries.recalls).to.contain(SECOND_RECALL);
          expect(modifiedEntries.makes).to.be.an('array');
          expect(modifiedEntries.makes).to.have.lengthOf(0);
          expect(modifiedEntries.models).to.be.an('array');
          expect(modifiedEntries.models).to.have.lengthOf(0);
          done();
        });
    });
    it('When recall to be updated is invalid and it has previous version, returns modifiedEntries array without that recall', (done) => {
      this.getAllRecalls = getAllRecallsReturns(null, [FIRST_RECALL]);
      this.getAllModels = getAllModelsReturns(null, [firstModelRecord]);
      this.getAllMakes = getAllMakesReturns(null, [firstMakeRecord]);

      const currentRecalls = new Map();
      currentRecalls.set(FIRST_RECALL_INVALID.make_model_recall_number, FIRST_RECALL_INVALID);

      recallDataProcessor.compare(s3Properties, currentRecalls,
        (err, s3Prop, modifiedEntries, deletedEntries) => {
          expect(modifiedEntries.recalls).to.be.an('array');
          expect(modifiedEntries.recalls).to.have.lengthOf(0);
          expect(modifiedEntries.makes).to.be.an('array');
          expect(modifiedEntries.makes).to.have.lengthOf(0);
          expect(modifiedEntries.models).to.be.an('array');
          expect(modifiedEntries.models).to.have.lengthOf(0);

          expect(deletedEntries.recalls).to.be.an('array');
          expect(deletedEntries.recalls).to.have.lengthOf(0);
          expect(deletedEntries.makes).to.be.an('array');
          expect(deletedEntries.makes).to.have.lengthOf(0);
          expect(deletedEntries.models).to.be.an('array');
          expect(deletedEntries.models).to.have.lengthOf(0);
          done();
        });
    });
    it('When new recall to be added is invalid, returns modifiedEntries array without that recall', (done) => {
      this.getAllRecalls = getAllRecallsReturns(null, [FIRST_RECALL]);
      this.getAllModels = getAllModelsReturns(null, [firstModelRecord]);
      this.getAllMakes = getAllMakesReturns(null, [firstMakeRecord]);

      const currentRecalls = new Map();
      currentRecalls.set(INVALID_RECALL.make_model_recall_number, INVALID_RECALL);
      currentRecalls.set(FIRST_RECALL.make_model_recall_number, FIRST_RECALL);

      recallDataProcessor.compare(s3Properties, currentRecalls,
        (err, s3Prop, modifiedEntries, deletedEntries) => {
          expect(modifiedEntries.recalls).to.be.an('array');
          expect(modifiedEntries.recalls).to.have.lengthOf(0);
          expect(modifiedEntries.makes).to.be.an('array');
          expect(modifiedEntries.makes).to.have.lengthOf(0);
          expect(modifiedEntries.models).to.be.an('array');
          expect(modifiedEntries.models).to.have.lengthOf(0);

          expect(deletedEntries.recalls).to.be.an('array');
          expect(deletedEntries.recalls).to.have.lengthOf(0);
          expect(deletedEntries.makes).to.be.an('array');
          expect(deletedEntries.makes).to.have.lengthOf(0);
          expect(deletedEntries.models).to.be.an('array');
          expect(deletedEntries.models).to.have.lengthOf(0);
          done();
        });
    });
  });
  describe('insert() method', () => {
    const updateError = 'Mocked error';

    const modifiedEntries = new RecallsMakesModels();
    const deletedEntries = new RecallsMakesModels();

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('Sends requests to update recalls, makes and models', (done) => {
      mockApiMethodReturnsError(sandbox, 'updateRecalls', null); // No errors, successful call
      mockApiMethodReturnsError(sandbox, 'updateMakes', null); // No errors, successful call
      mockApiMethodReturnsError(sandbox, 'updateModels', null); // No errors, successful call

      recallDataProcessor.insert(s3Properties, modifiedEntries, deletedEntries,
        (err, s3, deletedKeys) => {
          expect(dataUpdateApiClient.updateRecalls.calledOnce).to.equal(true);
          expect(dataUpdateApiClient.updateMakes.calledOnce).to.equal(true);
          expect(dataUpdateApiClient.updateModels.calledOnce).to.equal(true);
          expect(deletedKeys).to.equal(deletedEntries);
          expect(s3).to.equal(s3Properties);
          expect(err).to.be.equal(null);
          done();
        });
    });
    it('Returns an error when updating recalls failed', (done) => {
      mockApiMethodReturnsError(sandbox, 'updateRecalls', updateError);
      mockApiMethodReturnsError(sandbox, 'updateMakes', null);
      mockApiMethodReturnsError(sandbox, 'updateModels', null);

      recallDataProcessor.insert(s3Properties, modifiedEntries, deletedEntries, (err) => {
        expect(dataUpdateApiClient.updateRecalls.calledOnce).to.equal(true);
        expect(dataUpdateApiClient.updateMakes.calledOnce).to.equal(true);
        expect(dataUpdateApiClient.updateModels.calledOnce).to.equal(true);
        expect(err).to.equal(updateError);
        done();
      });
    });
    it('Returns an error when updating makes failed', (done) => {
      mockApiMethodReturnsError(sandbox, 'updateRecalls', null);
      mockApiMethodReturnsError(sandbox, 'updateMakes', updateError);
      mockApiMethodReturnsError(sandbox, 'updateModels', null);

      recallDataProcessor.insert(s3Properties, modifiedEntries, deletedEntries, (err) => {
        expect(dataUpdateApiClient.updateRecalls.calledOnce).to.equal(true);
        expect(dataUpdateApiClient.updateMakes.calledOnce).to.equal(true);
        expect(dataUpdateApiClient.updateModels.calledOnce).to.equal(true);
        expect(err).to.equal(updateError);
        done();
      });
    });

    it('Returns an error when updating models failed', (done) => {
      mockApiMethodReturnsError(sandbox, 'updateRecalls', null);
      mockApiMethodReturnsError(sandbox, 'updateMakes', null);
      mockApiMethodReturnsError(sandbox, 'updateModels', updateError);

      recallDataProcessor.insert(s3Properties, modifiedEntries, deletedEntries, (err) => {
        expect(dataUpdateApiClient.updateRecalls.calledOnce).to.equal(true);
        expect(dataUpdateApiClient.updateRecalls.calledOnce).to.equal(true);
        expect(dataUpdateApiClient.updateMakes.calledOnce).to.equal(true);
        expect(dataUpdateApiClient.updateModels.calledOnce).to.equal(true);
        expect(err).to.equal(updateError);
        done();
      });
    });
  });

  describe('delete() method', () => {
    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });
    afterEach(() => {
      sandbox.restore();
    });
    const deletedEntries = new RecallsMakesModels();
    const deletionError = new Error('Unable to delete recalls');

    it('Sends requests to update recalls, makes and models', (done) => {
      mockApiMethodReturnsError(sandbox, 'deleteRecalls', null); // No errors, successful call
      mockApiMethodReturnsError(sandbox, 'deleteMakes', null); // No errors, successful call
      mockApiMethodReturnsError(sandbox, 'deleteModels', null); // No errors, successful call

      recallDataProcessor.delete(s3Properties, deletedEntries,
        (err, s3) => {
          expect(dataUpdateApiClient.deleteRecalls.calledOnce).to.equal(true);
          expect(dataUpdateApiClient.deleteMakes.calledOnce).to.equal(true);
          expect(dataUpdateApiClient.deleteModels.calledOnce).to.equal(true);
          expect(s3).to.equal(s3Properties);
          expect(err).to.be.equal(null);
          done();
        });
    });
    it('Returns an error when deleting recalls failed', (done) => {
      mockApiMethodReturnsError(sandbox, 'deleteRecalls', deletionError);
      mockApiMethodReturnsError(sandbox, 'deleteMakes', null); // No errors, successful call
      mockApiMethodReturnsError(sandbox, 'deleteModels', null); // No errors, successful call

      recallDataProcessor.delete(s3Properties, deletedEntries,
        (err) => {
          expect(dataUpdateApiClient.deleteRecalls.calledOnce).to.equal(true);
          expect(dataUpdateApiClient.deleteMakes.calledOnce).to.equal(true);
          expect(dataUpdateApiClient.deleteModels.calledOnce).to.equal(true);
          expect(err).to.be.equal(deletionError);
          done();
        });
    });
    it('Returns an error when deleting makes failed', (done) => {
      mockApiMethodReturnsError(sandbox, 'deleteRecalls', null); // No errors, successful call
      mockApiMethodReturnsError(sandbox, 'deleteMakes', deletionError);
      mockApiMethodReturnsError(sandbox, 'deleteModels', null); // No errors, successful call

      recallDataProcessor.delete(s3Properties, deletedEntries,
        (err) => {
          expect(dataUpdateApiClient.deleteRecalls.calledOnce).to.equal(true);
          expect(dataUpdateApiClient.deleteMakes.calledOnce).to.equal(true);
          expect(dataUpdateApiClient.deleteModels.calledOnce).to.equal(true);
          expect(err).to.be.equal(deletionError);
          done();
        });
    });
    it('Returns an error when deleting models failed', (done) => {
      mockApiMethodReturnsError(sandbox, 'deleteRecalls', null); // No errors, successful call
      mockApiMethodReturnsError(sandbox, 'deleteMakes', null); // No errors, successful call
      mockApiMethodReturnsError(sandbox, 'deleteModels', deletionError);

      recallDataProcessor.delete(s3Properties, deletedEntries,
        (err) => {
          expect(dataUpdateApiClient.deleteRecalls.calledOnce).to.equal(true);
          expect(dataUpdateApiClient.deleteMakes.calledOnce).to.equal(true);
          expect(dataUpdateApiClient.deleteModels.calledOnce).to.equal(true);
          expect(err).to.be.equal(deletionError);
          done();
        });
    });
  });

  describe('copyCsvToAssets() method', () => {
    it('Calls AWS S3 client copyObject() method', (done) => {
      this.copyObject = sinon.spy(s3Properties.s3, 'copyObject');

      recallDataProcessor.copyCsvToAssets(s3Properties, (err) => {
        expect(this.copyObject.calledOnce).to.equal(true);
        expect(err).to.equal(null);
        done();
      });
    });
  });

  describe('isDeleteThresholdExceeded() method', () => {
    it('is false when threshold is not exceeded', () => {
      sinon.stub(envVariables, 'deleteThreshold').value('2.5');

      const isExceeded = recallDataProcessor.isDeleteThresholdExceeded(25, 1000);

      expect(isExceeded).to.be.equal(false);
    });
    it('is true when threshold is exceeded', () => {
      sinon.stub(envVariables, 'deleteThreshold').value('2.5');

      const isExceeded = recallDataProcessor.isDeleteThresholdExceeded(26, 1000);

      expect(isExceeded).to.be.equal(true);
    });
  });
});
