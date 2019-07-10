
// Require dependencies
const Model = require('model');

/**
 * Create acl model
 */
class AffiliateCode extends Model {
  /**
   * Sanitises acl class
   *
   * @return {*}
   */
  sanitise() {
    // Return id/name/value
    return {
      id   : this.get('_id') ? this.get('_id').toString() : false,
      code : this.get('code'),
    };
  }
}

/**
 * Export acl model
 * @type {acl}
 */
module.exports = AffiliateCode;
