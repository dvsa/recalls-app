
const Parser = require('./csvRecallsParser');

class RecallDataProcessor {
  static get bufferError() { return 'Cannot parse data as it is not buffered'; }

  static get noDataError() { return 'Cannot parse empty data'; }

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
    if (!(data instanceof Buffer)) {
      console.error(RecallDataProcessor.bufferError);
      next(new Error(RecallDataProcessor.bufferError));
    } else if (data.length === 0) {
      console.error(RecallDataProcessor.noDataError);
      next(new Error(RecallDataProcessor.noDataError));
    } else {
      console.info('Parsing the buffered CSV data');
      const parser = new Parser(data, 'CP1252');
      const recalls = parser.parse();
      const makes = parser.constructor.extractMakes(recalls);
      const models = parser.constructor.extractModels(recalls);

      next(null, recalls, makes, models);
    }
  }

  static insert(recalls, makes, models, next) {
    console.info('Here data would be inserted into the db');
    console.info(`Number of recalls: ${recalls.size}`);
    console.info(`Number of unique makes in the models map: ${Object.keys(models).length}`);
    console.info(`Number of vehicle makes: ${makes.vehicle.size}`);
    console.info(`Number of equipment makes: ${makes.equipment.size}`);
    next(null);
  }
}

module.exports = RecallDataProcessor;
