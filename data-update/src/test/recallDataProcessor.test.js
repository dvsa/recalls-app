const fs = require('fs');
const sinon = require('sinon');
const { expect } = require('chai');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');
const MakeDbRecordDto = require('cvr-common/src/dto/makeDbRecord');
const ModelDbRecordDto = require('cvr-common/src/dto/modelDbRecord');
const recallDataProcessor = require('../recallDataProcessor');
const dataUpdateApiClient = require('../dataUpdateApiClient');
const S3BucketObjectProperties = require('../dto/s3BucketObjectProperties');

let sandbox;
const MAKE_TOYOTA = 'Toyota';
const MAKE_BMW = 'BMW';
const MODEL_COROLLA = 'Corolla';
const MODEL_E90 = 'E90';
const FIRST_RECALL = new RecallDbRecordDto(null, 'R/1234/01', MAKE_TOYOTA, null, null, null, null, MODEL_COROLLA);
const SECOND_RECALL = new RecallDbRecordDto(null, 'R/2222/01', MAKE_BMW, null, null, null, null, MODEL_E90);
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
    const firstMakeRecord = new MakeDbRecordDto('vehicle', new Set([FIRST_RECALL.make]));

    beforeEach(() => {
      this.getAllRecalls = getAllRecallsReturns(null, [FIRST_RECALL]);
    });
    afterEach(() => {
      this.getAllRecalls.restore();
      this.getAllMakes.restore();
      this.getAllModels.restore();
    });
    it('Returns arrays of modified recalls, models and makes', (done) => {
      this.getAllModels = getAllModelsReturns(null, [firstModelRecord]);
      this.getAllMakes = getAllMakesReturns(null, [firstMakeRecord]);

      const currentRecalls = new Map();
      currentRecalls.set(FIRST_RECALL.make_model_recall_number, FIRST_RECALL);
      currentRecalls.set(SECOND_RECALL.make_model_recall_number, SECOND_RECALL);

      recallDataProcessor.compare(s3Properties, currentRecalls,
        (err, s3Prop, modifiedRecalls, modifiedMakes, modifiedModels) => {
          expect(modifiedRecalls).to.be.an('array');
          expect(modifiedRecalls).to.have.lengthOf(1);
          expect(modifiedRecalls).to.contain(SECOND_RECALL);
          expect(modifiedMakes).to.be.an('array');
          expect(modifiedMakes[0].makes).to.deep.include(SECOND_RECALL.make);
          expect(modifiedModels).to.be.an('array');
          expect(modifiedModels[0].models).to.deep.include(SECOND_RECALL.model);
          done();
        });
    });
    it('Returns modified recalls even if it was unable to fetch previous makes or models', (done) => {
      const currentRecalls = new Map();
      this.getAllModels = getAllModelsReturns(ERROR);
      this.getAllMakes = getAllMakesReturns(ERROR);

      currentRecalls.set(FIRST_RECALL.make_model_recall_number, FIRST_RECALL);
      currentRecalls.set(SECOND_RECALL.make_model_recall_number, SECOND_RECALL);

      recallDataProcessor.compare(s3Properties, currentRecalls,
        (err, s3Prop, modifiedRecalls, modifiedMakes, modifiedModels) => {
          expect(modifiedRecalls).to.be.an('array');
          expect(modifiedRecalls).to.have.lengthOf(1);
          expect(modifiedRecalls).to.contain(SECOND_RECALL);
          expect(modifiedMakes).to.be.an('array');
          expect(modifiedMakes).to.have.lengthOf(0);
          expect(modifiedModels).to.be.an('array');
          expect(modifiedModels).to.have.lengthOf(0);
          done();
        });
    });
  });
  describe('insert() method', () => {
    const updateError = 'Mocked error';
    const recalls = [];
    const makes = [];
    const models = [];

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('Sends requests to update recalls, makes and models and copies the CSV to another bucket', (done) => {
      mockApiMethodReturnsError(sandbox, 'updateRecalls', null); // No errors, successful call
      mockApiMethodReturnsError(sandbox, 'updateMakes', null); // No errors, successful call
      mockApiMethodReturnsError(sandbox, 'updateModels', null); // No errors, successful call

      recallDataProcessor.insert(s3Properties, recalls, makes, models, (err, data) => {
        expect(dataUpdateApiClient.updateRecalls.calledOnce).to.equal(true);
        expect(dataUpdateApiClient.updateMakes.calledOnce).to.equal(true);
        expect(dataUpdateApiClient.updateModels.calledOnce).to.equal(true);
        expect(data).to.equal(s3CopyObjectResult);
        expect(err).to.be.equal(null);
        done();
      });
    });
    it('Returns an error when updating recalls failed', (done) => {
      mockApiMethodReturnsError(sandbox, 'updateRecalls', updateError);
      mockApiMethodReturnsError(sandbox, 'updateMakes', null);
      mockApiMethodReturnsError(sandbox, 'updateModels', null);

      recallDataProcessor.insert(s3Properties, recalls, makes, models, (err) => {
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

      recallDataProcessor.insert(s3Properties, recalls, makes, models, (err) => {
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

      recallDataProcessor.insert(s3Properties, recalls, makes, models, (err) => {
        expect(dataUpdateApiClient.updateRecalls.calledOnce).to.equal(true);
        expect(dataUpdateApiClient.updateMakes.calledOnce).to.equal(true);
        expect(dataUpdateApiClient.updateModels.calledOnce).to.equal(true);
        expect(err).to.equal(updateError);
        done();
      });
    });
  });
});
