const RecallDto = require('cvr-common/src/dto/recall');
const RecallDbRecordDto = require('cvr-common/src/dto/recallDbRecord');
const { logger } = require('cvr-common/src/logger/loggerFactory');

class RecallsResource {
  constructor(recallsRepository) {
    this.recallsRepository = recallsRepository;
  }

  static mapToRecallList(resultList) {
    return resultList.map(result => new RecallDto(
      result.make,
      result.model,
      result.recall_number,
      result.defect,
      result.launch_date,
      result.concern,
      result.remedy,
      result.vehicle_number,
      result.build_range,
    ));
  }

  static mapRecallToListDbRecordDto(resultList) {
    return resultList.map((result) => {
      const recall = new RecallDbRecordDto(
        result.launch_date,
        result.recall_number,
        result.make,
        result.concern,
        result.defect,
        result.remedy,
        result.vehicle_number,
        result.model,
      );

      recall.build_range = result.build_range ? result.build_range : [];
      recall.vin_range = result.vin_range ? result.vin_range : [];

      return recall;
    });
  }

  getAllRecalls(callback) {
    this.recallsRepository.getAllRecalls((err, data) => {
      if (err) {
        this.constructor.handleError(err, null, null, null, null, callback);
      } else {
        logger.info(`Mapping all recalls. Number of fetched items: ${data.Items.length}`);
        const recalls = this.constructor.mapRecallToListDbRecordDto(data.Items);
        callback(null, recalls);
      }
    });
  }

  getByMakeAndModel(type, make, model, callback) {
    this.recallsRepository.getByMakeAndModel(type, make, model, (err, data) => {
      if (err) {
        this.constructor.handleError(err, type, make, model, null, callback);
      } else {
        logger.info(`Recalls retrieved for type=${type}, make=${make}, model=${model}`);
        const recalls = this.constructor.mapToRecallList(data.Items);
        callback(null, recalls);
      }
    });
  }

  getByMakeModelAndYear(type, make, model, year, callback) {
    this.recallsRepository.getByMakeAndModel(type, make, model, (err, data) => {
      if (err) {
        this.constructor.handleError(err, type, make, model, year, callback);
      } else {
        logger.info(`Recalls retrieved for type=${type}, make=${make}, model=${model}, year=${year}`);
        const mappedRecalls = this.constructor.mapToRecallList(data.Items);
        const filteredRecalls = this.constructor.filterByDate(mappedRecalls, year);
        callback(null, filteredRecalls);
      }
    });
  }

  updateRecalls(recalls, callback) {
    if (recalls == null || recalls.length === 0) {
      logger.info('Received data contains no recalls. Skipping the DB update process.');
      callback(null);
    } else {
      const recallsList = this.constructor.mapRecallToListDbRecordDto(recalls);
      this.recallsRepository.updateRecalls(recallsList, (err) => {
        if (err) {
          logger.error('Unable to update recalls. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
        } else {
          logger.info('Recalls uploaded successfully in recalls table');
          callback(null);
        }
      });
    }
  }

  static handleError(err, type, make, model, year, callback) {
    logger.error(`An error occurred while fetching recalls for type=${type}, make=${make}, model=${model}, year=${year}`);
    callback(err);
  }

  /**
   * Filters out recalls which contain no build date range that includes given year
   * @param {RecallDto[]} recalls
   * @param {number} year
   */
  static filterByDate(recalls, year) {
    return recalls.filter((recall) => {
      for (const dateRange of recall.buildRange) {
        if (this.isYearWithinDateRange(dateRange.start, dateRange.end, year)) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * True if the date range (startDate - endDate) includes at least a single day of given year
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {number} year
   */
  static isYearWithinDateRange(startDate, endDate, year) {
    if (this.isAnyDateInvalid([startDate, endDate])) {
      return false;
    }
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    return startDate <= yearEnd && endDate >= yearStart;
  }

  static isAnyDateInvalid(dates) {
    for (const date of dates) {
      if (typeof date.getTime !== 'function' || Number.isNaN(date.getTime())) {
        return true;
      }
    }
    return false;
  }
}

module.exports = RecallsResource;
