const async = require('async');
const AWS = require('aws-sdk');
const util = require('util');

const s3 = new AWS.S3();

module.exports = {
    handler: (lambdaEvent, context) => {
        console.log("Reading options from event:\n", util.inspect(lambdaEvent, {depth: 5}));
        var srcBucket = lambdaEvent.Records[0].s3.bucket.name;
        // Object key may have spaces or unicode non-ASCII characters.
        var srcKey = decodeURIComponent(lambdaEvent.Records[0].s3.object.key.replace(/\+/g, " "));  
        console.log('Source bucket', srcBucket);

        async.waterfall([
            function download(next) {
                // Download the csv file from S3
                console.log('Downloading csv data from S3');
                s3.getObject({
                        Bucket: srcBucket,
                        Key: srcKey
                    },
                    next);
            },
            function parse(response, next) {
                const csv = response.Body;
                if (csv !== null) {
                    // TODO: Parse csv data
                    console.log('Here data would be parsed');
                    next(null, csv);
                } else {
                    console.error('csv file is null');
                    next('error');
                }
            },
            function insert(data, next) {
                // TODO: Insert the parsed data to database
                console.log('Here data would be inserted into the db');
            }
            ], function (err) {
                if (err) {
                    console.error('Error: ' + err);
                } else {
                    console.log('Success');
                }
            }
        );
    }
};
