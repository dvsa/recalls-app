const DateParser = require('../../helpers/DateParser');
const expect = require('chai').expect;

const csvYear = '2006';
const csvMonth = '07';
const csvDay = '28';
const csvDate = `${csvDay}/${csvMonth}/${csvYear}`;
const isoDate = `${csvYear}-${csvMonth}-${csvDay}`;

const parser = new DateParser();

describe('DateParser', () => {
  describe('parseSlashFormatDate()', () => {
    it('Should parse custom CSV dates to a Date object', (done) => {
      const parsedDate = parser.parseSlashFormatDate(csvDate);

      expect(parsedDate).to.be.a('Date');
      expect(parsedDate.getFullYear().toString()).to.equal(csvYear);
      done();
    });

    it('Should handle null values', (done) => {
      const parsedDate = parser.parseSlashFormatDate(null);

      expect(parsedDate).to.be.null;
      done();
    });

    it('Should return null for empty strings', (done) => {
      const parsedDate = parser.parseSlashFormatDate('');

      expect(parsedDate).to.be.null;
      done();
    });

    it('Should return null for malformed data', (done) => {
      const parsedDate = parser.parseSlashFormatDate('32/10/2000');

      expect(parsedDate).to.be.null;
      done();
    });
  });
  describe('slashFormatToISO()', () => {
    it('Should convert slash formatted dates to a simplified ISO date format without the time segment', (done) => {
      const parsedDate = parser.slashFormatToISO(csvDate);

      expect(parsedDate).to.equal(isoDate);
      done();
    });

    it('Should return null if it is unable to convert string to a date', (done) => {
      const parsedDate = parser.slashFormatToISO('a');

      expect(parsedDate).to.be.null;
      done();
    });
  });
});
