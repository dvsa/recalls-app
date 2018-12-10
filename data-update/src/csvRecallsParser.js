const DateParser = require('cvr-common/helpers/DateParser');
const RecallDbRecordDto = require('cvr-common/dto/recallDbRecord');

const iconv = require('iconv-lite');
const csvConverter = require('json-2-csv');

const dateParser = new DateParser();

class CsvRecallsParser {
  constructor(bufferedData, sourceEncoding) {
    const dataDecoded = iconv.decode(Buffer.from(bufferedData), sourceEncoding);
    const dataEncoded = iconv.encode(dataDecoded, 'utf8');

    this.data = dataEncoded.toString('utf8');
  }

  csvLineToRecall(line) {
    const trim = this.constructor.trimIfNotEmpty;
    return new RecallDbRecordDto(
      trim(dateParser.slashFormatToISO(line['Launch Date'])),
      trim(line['Recalls Number']),
      trim(line.Make),
      trim(line.Concern),
      trim(line.Defect),
      trim(line.Remedy),
      trim(line['Vehicle Numbers']),
      trim(line.Model),
      trim(line['VIN Start']),
      trim(line['VIN End']),
      trim(dateParser.slashFormatToISO(line['Build Start'])),
      trim(dateParser.slashFormatToISO(line['Build End'])),
    );
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
   * Returns an object containing 2 sets - vehicle and equipment makes
   * { vehicle: Set<String>, equipment: Set<String> }
   * @param {Map<RecallDbRecordDto>} recalls
   */
  static extractMakes(recalls) {
    const makes = { vehicle: new Set(), equipment: new Set() };

    for (const keyValuePair of recalls) {
      const recall = keyValuePair[1];

      if (recall.type === 'equipment') {
        makes.equipment.add(recall.make);
      } else {
        makes.vehicle.add(recall.make);
      }
    }

    return makes;
  }

  /**
   * Returns a map of unique models, each key consists of recall type and make,
   * each element is a set of models
   * @param {Map<RecallDbRecordDto>} recalls
   */
  static extractModels(recalls) {
    const models = new Map();

    for (const keyValuePair of recalls) {
      const recall = keyValuePair[1];
      const modelKey = `${recall.type}-${recall.make}`;

      models[modelKey] = (models[modelKey] || new Set()).add(recall.model);
    }

    return models;
  }

  /**
   * Parses the CSV file, returns a collection of recalls
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
          const recall = this.csvLineToRecall(line);
          recalls = this.addRecallOrMergeIfExists(recall, recalls);
        }
      }
    }, { delimiter: { array: '\n', field: ',' } });

    return recalls;
  }
}

module.exports = CsvRecallsParser;
