const S3Client = require('./s3/s3Client');

class RecallDataParser {
  constructor(srcBucket, srcKey) {
    this.s3 = new S3Client();
    this.srcBucket = srcBucket;
    this.srcKey = srcKey;
  }

  static dowload(next) {
    // Download the csv file from S3
    console.log('Downloading csv data from S3');
    this.s3.getObject({
      Bucket: this.srcBucket,
      Key: this.srcKey,
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
      console.log(`File length: ${data.ContentLength}, last modified: ${data.LastModified}`);
      next(null, csvBuffer);
    });
  }

  static parse(data, next) {
    // TODO: Parse csv data
    console.log('Here data would be parsed');
    const csv = data;
    next(null, csv);
  }

  static insert(data, next) {
    // TODO: Insert the parsed data to database
    console.log('Here data would be inserted into the db');
    next(null, data);
  }

  getParserHandlers() {
    return [
      this.download,
      this.parse,
      this.insert,
    ];
  }
}

module.exports = RecallDataParser;
