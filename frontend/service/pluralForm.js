const REGEX_NUMBER = /\[num\]/;
const REGEX_TEXT = /{(.[^}]*)}/g;

class PluralForm {
  /*
  Create singlular or plural sentence based on number given
    (all zero and numbers bigger than 1 return plural sentence)

  var text = "There {are|is} [num] recall{s}."

  var number = 2 // or 0, 3, 4, ...
    "There are 2 recalls."

  var number = 1
    "There is 1 recall."
*/
  static getSingularOrPlural(text, number) {
    const indx = number !== 1 ? 0 : 1;
    const str = text
      .replace(REGEX_NUMBER, number)
      .replace(REGEX_TEXT, (wholematch, firstmatch) => firstmatch.split('|')[indx] || '');

    return str;
  }
}

module.exports = PluralForm;
