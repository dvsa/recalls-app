const { logger } = require('../logger/loggerFactory');

class DateParser {
  /**
   * Accepts dates in the following format: dd/mm/yyyy
   * Returns a Date object or null if it was unable to parse the date
   * @param {String} date
   * @returns {Date|null}
   */
  static parseSlashFormatDate(date) {
    if (date == null || date.length === 0) {
      return null;
    }

    const dateSegments = date.match(new RegExp(/(\d+)\/(\d+)\/(\d+)/));

    if (dateSegments == null || dateSegments.length !== 4) {
      logger.warn(`Unable to parse the following date: ${date}. Please use the following format: dd/mm/yyyy`);
      return null;
    }

    const day = dateSegments[1];
    const month = dateSegments[2];
    const year = dateSegments[3];

    const isoDateString = `${year}-${month}-${day}`;
    const parsedDate = new Date(isoDateString);

    if (Number.isNaN(Number(parsedDate))) {
      logger.warn(`Unable to parse the following date: ${date}. Please use the following format: dd/mm/yyyy`);
      return null;
    }
    return parsedDate;
  }

  /**
   * Converts dates in the following format: dd/mm/yyyy to YYYY-mm-dd
   */
  static slashFormatToISO(date) {
    const parsedDate = DateParser.parseSlashFormatDate(date);
    if (parsedDate == null) {
      return null;
    }
    return parsedDate.toISOString().split('T')[0];
  }
}


module.exports = DateParser;
