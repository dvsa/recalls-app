const DateParser = require('cvr-common/src/helpers/DateParser');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');

const iconv = require('iconv-lite');
const csvConverter = require('json-2-csv');

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
      || (!line['Recalls Number'] || trim(line['Recalls Number']).length === 0);
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
   * Parses the CSV file, returns a collection of recalls
   * Recalls are mapped by make_model_recall_number key
   * @returns { recalls: Map<String, RecallDbRecordDto> }
   */
  parse() {
    let recalls = new Map();
    csvConverter.csv2json(this.data, (err, json) => {
      if (err) {
        console.error(`Error while parsing the csv data: ${err}`);
      } else {
        console.info(`Number of CSV records: ${json.length}`);

        for (const line of json) {
          if (this.isAnyRequiredFieldMissing(line)) {
            console.warn(`The following CSV line cannot be processed as it is missing one of the required fields (Make, Model, Recalls Number): \r${JSON.stringify(line)}`);
          } else {
            const recall = this.csvLineToRecall(line);
            recalls = this.addRecallOrMergeIfExists(recall, recalls);
          }
        }
      }
    }, { delimiter: { array: '\n', field: ',' } });

    return recalls;
  }
}

module.exports = CsvRecallsParser;
