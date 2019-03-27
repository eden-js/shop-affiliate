// require dependencies
const model = require ('model');

/**
 * Player Ban
 * To ban a player again, create a new ban record.
 */
class credit extends model {
  /**
   * construct instance
   */
  constructor () {
    // run super
    super (...arguments);
  }

  /**
   * sanitise method
   */
  async sanitise () {
    // return data
    return {
      'id' : this.get ('_id') ? (this.get ('_id').toString ()) : null
    };
  }
}

/**
 * export class
 *
 * @type {credit}
 */
exports = module.exports = credit;
