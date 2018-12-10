const async = require('async');
const util = require('util');
const RecallDataParser = require('./src/recallDataParser');

module.exports = {
  handler: (lambdaEvent) => {
    console.log('Reading options from event:\n', util.inspect(lambdaEvent, { depth: 5 }));
    const srcBucket = lambdaEvent.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(lambdaEvent.Records[0].s3.object.key.replace(/\+/g, ' '));
    console.log('Source bucket', srcBucket);

    const recallDataParser = new RecallDataParser(srcBucket, srcKey);

    async.waterfall(
      recallDataParser.getParserHandlers(),
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
