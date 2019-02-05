const async = require('async');
const util = require('util');
const loggerFactory = require('cvr-common/src/logger/loggerFactory');
const envVariables = require('./src/config/environmentVariables');
const LoggerContext = require('./src/logger/context');
const packagesJson = require('./package.json');

loggerFactory.initialize(null, LoggerContext.getContext(), {
  logLevel: envVariables.logLevel,
  appName: packagesJson.name,
});

const S3Client = require('./src/s3/s3Client');
const RecallDataProcessor = require('./src/recallDataProcessor');

const s3Client = new S3Client();

const EXPECTED_CSV_FILE_NAME = 'RecallsFile.csv';

module.exports = {
  handler: (lambdaEvent) => {
    const { logger } = loggerFactory;
    logger.info('Reading options from event:\n', util.inspect(lambdaEvent, { depth: 5 }));
    const srcBucket = lambdaEvent.Records[0].s3.bucket.name;
    logger.info('Source bucket', srcBucket);
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(lambdaEvent.Records[0].s3.object.key.replace(/\+/g, ' '));
    if (srcKey === EXPECTED_CSV_FILE_NAME) {
      async.waterfall(
        [
          async.apply(RecallDataProcessor.download, s3Client.s3, srcBucket, srcKey),
          RecallDataProcessor.parse,
          RecallDataProcessor.compare,
          RecallDataProcessor.insert,
          RecallDataProcessor.delete,
          RecallDataProcessor.copyCsvToAssets,
        ],
        (err) => {
          if (err) {
            logger.error(`Error: ${err}`);
          } else {
            logger.info('Success');
          }
        },
      );
    } else {
      logger.error(`Triggered by incorrect file: ${srcKey}. Expected file: ${EXPECTED_CSV_FILE_NAME}`);
    }
  },
};
