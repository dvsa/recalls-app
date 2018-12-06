const { expect } = require('chai');
const recallDataParser = require('../recallDataParser');

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

describe('RecallDataParser', () => {
  describe('download() method', () => {
    it('should return callback with data if getObject returns data', () => {
      recallDataParser.download(createS3Mock(), 'srcBucket', 'srcKey', (err, data) => {
        expect(data).to.be.a('string');
        expect(data).to.equal('csv');
      });
    });

    it('should return callback with error if getObject returns error', () => {
      recallDataParser.download(createS3MockReturnsError(), 'srcBucket', 'srcKey', (err, data) => {
        expect(data).to.equal(undefined);
        expect(err).to.be.an('Error');
        expect(err.message).to.equal('I\'m not working');
      });
    });

    it('should return callback with error if getObject doesn\'t return data', () => {
      recallDataParser.download(createS3MockWithEmptyBody(), 'srcBucket', 'srcKey', (err, data) => {
        expect(data).to.equal(undefined);
        expect(err).to.be.an('Error');
        expect(err.message).to.equal('Downloaded CSV file is empty');
      });
    });
  });
});
