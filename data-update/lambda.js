const async = require('async');
const AWS = require('aws-sdk');
const util = require('util');

const s3 = new AWS.S3();

module.exports = {
  handler: (lambdaEvent) => {
    console.log('Reading options from event:\n', util.inspect(lambdaEvent, { depth: 5 }));
    const srcBucket = lambdaEvent.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(lambdaEvent.Records[0].s3.object.key.replace(/\+/g, ' '));
    console.log('Source bucket', srcBucket);

    async.waterfall(
      [
        function download(next) {
          // Download the csv file from S3
          console.log('Downloading csv data from S3');
          s3.getObject({
            Bucket: srcBucket,
            Key: srcKey,
          },
          (err, data) => {
            if (err) {
              console.error('Error when dowloading csv file from S3 bucket');
              next('error');
            }
            const csvBuffer = data.Body;
            if (csvBuffer == null) {
              console.error('File is empty');
              next('error');
            }
            console.log(util.inspect(data, { depth: 5 })); // log metadanych (timestamp i rozmiar)
            next(null, csvBuffer);
          });
        },
        function parse(csvBuffer, next) {
          // TODO: Parse csv data
          console.log('Here data would be parsed');
          const csv = csvBuffer;
          next(null, csv);
        },
        function insert(data, next) {
          // TODO: Insert the parsed data to database
          console.log('Here data would be inserted into the db');
          next(null, data);
        },
      ],
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
