const dayjs = require('dayjs');
const { logger } = require('../logger/loggerFactory');

const DATE_INVALID = 'invalid';

class DateParser {
  /**
   * Accepts dates in the following format: dd/mm/yyyy
   * Returns a Date object, null if the date is empty
   * or 'invalid' if it was unable to parse the date
   * @param {String} date
   * @returns {Date|null|String}
   */
  static parseSlashFormatDate(date) {
    if (date == null || date.length === 0) {
      return null;
    }
    const dateSegments = date.match(new RegExp(/(\d+)\/(\d+)\/(\d+)/));

    if (dateSegments == null || dateSegments.length !== 4) {
      logger.warn(`Unable to parse the following date: ${date}. Please use the following format: dd/mm/yyyy`);
      return DATE_INVALID;
    }

    const day = dateSegments[1];
    const month = dateSegments[2];
    const year = dateSegments[3];

    const isoDateString = `${year}-${month}-${day}`;
    const parsedDate = new Date(isoDateString);
    const isYearLengthValid = year.length === 2 || year.length === 4;
    if (Number.isNaN(parsedDate.getTime()) || !isYearLengthValid
      || parsedDate.getFullYear > (new Date().getFullYear())) {
      logger.warn(`Unable to parse the following date: ${date}. Please use the following format: dd/mm/yyyy`);
      return DATE_INVALID;
    }
    return parsedDate;
  }

  /**
   * Accepts dates in the following format: YYYY-MM-DD
   * Returns a String, null if the date or format is empty
   * or 'invalid' if it was unable to parse the date
   * @param {String} date
   * @param {String} format
   * @returns {String|null}
  */
  static parseDateToFormat(date, format) {
    if (date == null || date.length === 0 || format == null || format.length === 0) {
      return null;
    }
    const dateSegments = date.match(new RegExp(/(\d{4})-(\d{2})-(\d{2})/));

    if (dateSegments == null || dateSegments.length !== 4) {
      logger.warn(`Unable to parse the following date: ${date}. Please use the following format: YYYY-MM-DD`);
      return DATE_INVALID;
    }

    return dayjs(new Date(date).toISOString()).format(format);
  }

  /**
   * Converts dates in the following format: dd/mm/yyyy to YYYY-mm-dd
   */
  static slashFormatToISO(date) {
    const parsedDate = DateParser.parseSlashFormatDate(date);
    if (parsedDate == null) {
      return null;
    }
    if (parsedDate === DATE_INVALID) {
      return DATE_INVALID;
    }
    return parsedDate.toISOString().split('T')[0];
  }
}


module.exports = DateParser;
