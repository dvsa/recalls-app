const async = require('async');
const util = require('util');
const RecallDataParser = require('./src/recallDataParser');

const recallDataParser = new RecallDataParser();

module.exports = {
  handler: (lambdaEvent) => {
    console.log('Reading options from event:\n', util.inspect(lambdaEvent, { depth: 5 }));
    const srcBucket = lambdaEvent.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(lambdaEvent.Records[0].s3.object.key.replace(/\+/g, ' '));
    console.log('Source bucket', srcBucket);

    async.waterfall(
      recallDataParser.getParserHandlers()
        .unshift(async.constant({ bucket: srcBucket, key: srcKey })),
      (err) => {
        if (err) {
          console.error(`Error: ${err}`);
        } else {
          console.log('Success');
        }
      },
    );
  },
};
