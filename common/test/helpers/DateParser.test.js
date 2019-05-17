const { expect } = require('chai');
const DateParser = require('../../src/helpers/DateParser');

const DATE_INVALID = 'invalid';

const csvYear = '2006';
const csvMonth = '07';
const csvDay = '28';
const csvDate = `${csvDay}/${csvMonth}/${csvYear}`;
const isoDate = `${csvYear}-${csvMonth}-${csvDay}`;

describe('DateParser', () => {
  describe('parseSlashFormatDate()', () => {
    it('Should parse custom CSV dates to a Date object', (done) => {
      const parsedDate = DateParser.parseSlashFormatDate(csvDate);

      expect(parsedDate).to.be.a('Date');
      expect(parsedDate.getFullYear().toString()).to.equal(csvYear);
      done();
    });

    it('Should handle null values', (done) => {
      const parsedDate = DateParser.parseSlashFormatDate(null);

      expect(parsedDate).to.be.null;
      done();
    });

    it('Should return null for empty strings', (done) => {
      const parsedDate = DateParser.parseSlashFormatDate('');

      expect(parsedDate).to.be.null;
      done();
    });

    it('Should return DATE_INVALID for malformed data', (done) => {
      const parsedDate = DateParser.parseSlashFormatDate('32/10/2000');

      expect(parsedDate).to.equal(DATE_INVALID);
      done();
    });

    it('Should return DATE_INVALID for incorrect data with 3-digit year', (done) => {
      const parsedDate = DateParser.parseSlashFormatDate('12/10/200');

      expect(parsedDate).to.equal(DATE_INVALID);
      done();
    });

    it('Should return DATE_INVALID for incorrect data with 1-digit year', (done) => {
      const parsedDate = DateParser.parseSlashFormatDate('12/10/2');

      expect(parsedDate).to.equal(DATE_INVALID);
      done();
    });

    it('Should return DATE_INVALID for incorrect data with 5-digit year', (done) => {
      const parsedDate = DateParser.parseSlashFormatDate('12/10/20000');

      expect(parsedDate).to.equal(DATE_INVALID);
      done();
    });
  });
  describe('slashFormatToISO()', () => {
    it('Should convert slash formatted dates to a simplified ISO date format without the time segment', (done) => {
      const parsedDate = DateParser.slashFormatToISO(csvDate);

      expect(parsedDate).to.equal(isoDate);
      done();
    });

    it('Should return DATE_INVALID if it is unable to convert string to a date', (done) => {
      const parsedDate = DateParser.slashFormatToISO('a');

      expect(parsedDate).to.equal(DATE_INVALID);
      done();
    });
  });
  describe('parseDateToFormat()', () => {
    it('Should convert date to correct format DD-MM-YYYY', (done) => {
      const parsedDate = DateParser.parseDateToFormat('2018-01-24', 'DD-MM-YYYY');

      expect(parsedDate).to.equal('24-01-2018');
      done();
    });
    it('Should convert date to correct format MM/DD/YYYY', (done) => {
      const parsedDate = DateParser.parseDateToFormat('2019-01-20', 'MM/DD/YYYY');

      expect(parsedDate).to.equal('01/20/2019');
      done();
    });
    it('Should return null if date is null', (done) => {
      const parsedDate = DateParser.parseDateToFormat(null, 'DD-MM-YYYY');

      expect(parsedDate).to.be.null;
      done();
    });
    it('Should return null if date is empty', (done) => {
      const parsedDate = DateParser.parseDateToFormat('', 'DD-MM-YYYY');

      expect(parsedDate).to.be.null;
      done();
    });
    it('Should return null if format is null', (done) => {
      const parsedDate = DateParser.parseDateToFormat('2018-01-01', null);

      expect(parsedDate).to.be.null;
      done();
    });
    it('Should return null if format is empty', (done) => {
      const parsedDate = DateParser.parseDateToFormat('2018-01-01', '');

      expect(parsedDate).to.be.null;
      done();
    });
    it('Should return error if date is invalid', (done) => {
      const parsedDate = DateParser.parseDateToFormat('a', 'DD-MM-YYYY');

      expect(parsedDate).to.equal(DATE_INVALID);
      done();
    });
    it('Should return error if date is with wrong format', (done) => {
      const parsedDate = DateParser.parseDateToFormat('2018-01-1', 'DD-MM-YYYY');

      expect(parsedDate).to.equal(DATE_INVALID);
      done();
    });
  });
});
