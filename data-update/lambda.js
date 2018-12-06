const async = require('async');
const util = require('util');
const S3Client = require('./src/s3/s3Client');
const RecallDataParser = require('./src/recallDataParser');

const EXPECTED_CSV_FILE_NAME = 'RecallsFile.csv';

const s3Client = new S3Client();

module.exports = {
  handler: (lambdaEvent) => {
    console.info('Reading options from event:\n', util.inspect(lambdaEvent, { depth: 5 }));
    const srcBucket = lambdaEvent.Records[0].s3.bucket.name;
    console.info('Source bucket', srcBucket);
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(lambdaEvent.Records[0].s3.object.key.replace(/\+/g, ' '));
    if (srcKey === EXPECTED_CSV_FILE_NAME) {
      async.waterfall(
        [
          async.apply(RecallDataParser.download, s3Client.s3, srcBucket, srcKey),
          RecallDataParser.parse,
          RecallDataParser.insert,
        ],
        (err) => {
          if (err) {
            console.error(`Error: ${err}`);
          } else {
            console.info('Success');
          }
        },
      );
    } else {
      console.error(`Triggered by incorrect file: ${srcKey}. Expected file: ${EXPECTED_CSV_FILE_NAME}`);
    }
  },
};
