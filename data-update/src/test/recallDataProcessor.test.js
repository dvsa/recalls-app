const fs = require('fs');
const { expect } = require('chai');
const recallDataProcessor = require('../recallDataProcessor');

function createS3Mock() {
  const s3 = {};
  s3.getObject = (bucketData, callback) => {
    callback(null, { Body: 'csv' });
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

describe('RecallDataProcessor', () => {
  describe('download() method', () => {
    it('should return callback with data if getObject returns data', () => {
      recallDataProcessor.download(createS3Mock(), 'srcBucket', 'srcKey', (err, data) => {
        expect(data).to.be.a('string');
        expect(data).to.equal('csv');
      });
    });

    it('should return callback with error if getObject returns error', () => {
      recallDataProcessor.download(createS3MockReturnsError(), 'srcBucket', 'srcKey', (err, data) => {
        expect(data).to.equal(undefined);
        expect(err).to.be.an('Error');
        expect(err.message).to.equal('I\'m not working');
      });
    });

    it('should return callback with error if getObject doesn\'t return data', () => {
      recallDataProcessor.download(createS3MockWithEmptyBody(), 'srcBucket', 'srcKey', (err, data) => {
        expect(data).to.equal(undefined);
        expect(err).to.be.an('Error');
        expect(err.message).to.equal('Downloaded CSV file is empty');
      });
    });
  });

  describe('parse() method', () => {
    it('should parse CSV data', () => {
      const data = fs.readFileSync(`${__dirname}/testData.csv`);
      const make = 'MERCEDES BENZ';
      const model = 'SPRINTER';
      const type = 'vehicle';
      const recallNumber = 'R/2010/184';

      recallDataProcessor.parse(data, (err, recalls, makes, models) => {
        expect(recalls).to.have.lengthOf(3);
        expect(makes.vehicle).to.have.lengthOf(2);
        expect(makes.equipment).to.have.lengthOf(1);
        expect(Object.keys(models)).to.have.lengthOf(3);

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
      recallDataProcessor.parse(data, (err) => {
        expect(err).to.be.an('Error');
        expect(err.message).to.equal(recallDataProcessor.bufferError);
      });
    });

    it('should raise an error if the buffered data is empty', () => {
      const data = Buffer.from('');
      recallDataProcessor.parse(data, (err) => {
        expect(err).to.be.an('Error');
        expect(err.message).to.equal(recallDataProcessor.noDataError);
      });
    });
  });
});
