
/** Groups arrays related to recalls makes and models of the same origin,
 * It can store recalls, makes and models that were updated at the same time
 * or primary keys of recalls makes and models that are about to be deleted
 */
class RecallsMakesModels {
  constructor(recalls, makes, models) {
    this.recalls = recalls || [];
    this.makes = makes || [];
    this.models = models || [];
  }
}

module.exports = RecallsMakesModels;
