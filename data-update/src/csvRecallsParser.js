const { logger } = require('cvr-common/src/logger/loggerFactory');
const DateParser = require('cvr-common/src/helpers/DateParser');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');

const iconv = require('iconv-lite');
const csvConverter = require('json-2-csv');
const RecallsCollection = require('./dto/recallsCollection');

class CsvRecallsParser {
  constructor(bufferedData, sourceEncoding) {
    const dataDecoded = iconv.decode(Buffer.from(bufferedData), sourceEncoding);
    const dataEncoded = iconv.encode(dataDecoded, 'utf8');

    this.data = dataEncoded.toString('utf8');
  }

  csvLineToRecall(line) {
    const trim = this.constructor.trimIfNotEmpty;
    return new RecallDbRecordDto(
      trim(DateParser.slashFormatToISO(line['Launch Date'])),
      trim(line['Recalls Number']),
      trim(line.Make),
      trim(line.Concern),
      trim(line.Defect),
      trim(line.Remedy),
      trim(line['Vehicle Numbers']),
      trim(line.Model),
      trim(line['VIN Start']),
      trim(line['VIN End']),
      trim(DateParser.slashFormatToISO(line['Build Start'])),
      trim(DateParser.slashFormatToISO(line['Build End'])),
    );
  }

  isAnyRequiredFieldMissing(line) {
    const trim = this.constructor.trimIfNotEmpty;
    return (!line.Make || trim(line.Make).length === 0)
      || (!line.Model || trim(line.Model).length === 0)
      || (!line.Remedy || trim(line.Remedy).length === 0)
      || (!line['Recalls Number'] || trim(line['Recalls Number']).length === 0);
  }

  isOnlyModelMissing(line) {
    const trim = this.constructor.trimIfNotEmpty;
    return (!line.Model || trim(line.Model).length === 0)
      && (line.Make && trim(line.Make).length !== 0)
      && (line['Recalls Number'] && trim(line['Recalls Number']).length !== 0);
  }

  static trimIfNotEmpty(field) {
    return (!field || field.length === 0) ? field : field.trim();
  }

  /**
   * If a recall with a given make_model_recall_number already exists in the map,
   * merge VIN and build ranges from the current recall with the existing one and update the map.
   * Otherwise just add a new key-value pair to the map
   *
   * @param {RecallDbRecordDto} currentRecall
   * @param {Map<String, RecallDbRecordDto>} recallsMap recalls mapped by make_model_recall_number
   */
  addRecallOrMergeIfExists(currentRecall, recallsMap) {
    let recall = currentRecall;
    const recallKey = currentRecall.make_model_recall_number;

    if (recallsMap.has(recallKey)) {
      const existingRecall = recallsMap.get(recallKey);
      recall = this.constructor.mergeDateAndVinRanges(existingRecall, currentRecall);
    }

    return recallsMap.set(recallKey, recall);
  }

  /**
   * @param {RecallDbRecordDto} sourceRecall
   * @param {RecallDbRecordDto} targetRecall
   */
  static mergeDateAndVinRanges(sourceRecall, targetRecall) {
    const mergedRecall = targetRecall;

    mergedRecall.vin_range = (targetRecall.vin_range || []).concat(sourceRecall.vin_range);
    mergedRecall.build_range = (targetRecall.build_range || []).concat(sourceRecall.build_range);

    return mergedRecall;
  }

  /**
   * Parses the CSV file, returns a collection of recalls,
   * containing of correct recalls map and an array of recalls without model.
   * Recalls are mapped by make_model_recall_number key.
   * @returns { RecallsCollection }
   */
  parse() {
    let recalls = new Map();
    const recallsWithMissingModel = [];
    csvConverter.csv2json(this.data, (err, json) => {
      if (err) {
        logger.error(`Error while parsing the csv data: ${err}`);
      } else {
        logger.info(`Number of CSV records: ${json.length}`);

        for (const line of json) {
          if (this.isAnyRequiredFieldMissing(line)) {
            if (this.isOnlyModelMissing(line)) {
              logger.warn(`The CSV line has only Model missing and will be kept, so any recall with ${line['Recalls Number']} recall number and ${line.Make} make won't be deleted`);
              const recallWithMissingModel = this.csvLineToRecall(line);
              recallsWithMissingModel.push(recallWithMissingModel);
            } else {
              logger.warn(`The following CSV line cannot be processed as it is missing one of the required fields (Make, Model, Remedy, Recalls Number): \r${JSON.stringify(line)}`);
            }
          } else {
            const recall = this.csvLineToRecall(line);
            recalls = this.addRecallOrMergeIfExists(recall, recalls);
          }
        }
      }
    }, { delimiter: { array: '\n', field: ',' } });

    return new RecallsCollection(recalls, recallsWithMissingModel);
  }
}

module.exports = CsvRecallsParser;
