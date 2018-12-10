const S3Client = require('./s3/s3Client');

class RecallDataParser {
  constructor() {
    this.s3 = new S3Client();
  }

  dowload(bukcetData, next) {
    // Download the csv file from S3
    console.log('Downloading csv data from S3');
    this.s3.getObject({
      Bucket: bukcetData.bucket,
      Key: bukcetData.key,
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

  parse(data, next) {
    // TODO: Parse csv data
    console.log('Here data would be parsed');
    const csv = data;
    this.csv = '';
    next(null, csv);
  }

  insert(data, next) {
    // TODO: Insert the parsed data to database
    console.log('Here data would be inserted into the db');
    this.csv = '';
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
