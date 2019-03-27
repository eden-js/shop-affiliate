
// Require dependencies
const Model = require('model');

/**
 * Create acl model
 */
class AffiliateCode extends Model {
  /**
   * Construct acl model
   */
  constructor() {
    // Run super
    super(...arguments);
  }

  /**
   * Sanitises acl class
   *
   * @return {*}
   */
  sanitise() {
    // Return id/name/value
    return {
      id    : this.get('_id') ? this.get('_id').toString() : false,
      name  : this.get('name'),
      value : this.get('value'),
    };
  }
}

/**
 * Export acl model
 * @type {acl}
 */
exports = module.exports = AffiliateCode;
