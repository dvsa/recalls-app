class RecallDataParser {
  static download(s3, srcBucket, srcKey, next) {
    // Download the csv file from S3
    console.info('Downloading csv data from S3');
    s3.getObject({
      Bucket: srcBucket,
      Key: srcKey,
    },
    (err, data) => {
      if (err) {
        console.error('Error when dowloading csv file from S3 bucket:', err);
        next(err);
      } else {
        const csvBuffer = data.Body;
        if (csvBuffer == null) {
          console.error('File is empty');
          next(new Error('Downloaded CSV file is empty'));
        } else {
          console.info(`File length: ${data.ContentLength}, last modified: ${data.LastModified}`);
          next(null, csvBuffer);
        }
      }
    });
  }

  static parse(data, next) {
    // TODO: Parse csv data
    console.info('Here data would be parsed');
    const csv = data;
    next(null, csv);
  }

  static insert(data, next) {
    // TODO: Insert the parsed data to database
    console.info('Here data would be inserted into the db');
    next(null, data);
  }
}

module.exports = RecallDataParser;
