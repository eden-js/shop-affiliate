// require dependencies
const model = require ('model');

/**
 * Player Ban
 * To ban a player again, create a new ban record.
 */
class code extends model {
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
      'id'       : this.get ('_id') ? (this.get ('_id').toString ()) : null,
      'code'     : this.get ('code'),
      'rate'     : this.get ('rate'),
      'user'     : (await this.get ('user')) ? await (await this.get ('user')).sanitise () : null,
      'state'    : this.get ('state'),
      'notes'    : this.get ('notes'),
      'discount' : this.get ('discount'),
    };
  }
}

/**
 * export class
 *
 * @type {code}
 */
exports = module.exports = code;
