
// Require dependencies
const Controller = require('controller');

// Require models
const Affiliate = model('affiliate');

// require helpers
const modelHelper     = helper('model');
const affiliateHelper = helper('affiliate');

/**
 * Build affiliate controller
 *
 * @acl   admin
 * @fail  next
 * @mount /affiliate
 */
class AffiliateController extends Controller {
  /**
   * Construct affiliate controller
   */
  constructor() {
    // Run super
    super();

    // bind build methods
    this.build = this.build.bind(this);

    // set building
    this.building = this.build();
  }

  // ////////////////////////////////////////////////////////////////////////////
  //
  // BUILD METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * builds affiliate controller
   */
  build() {

  }

  // ////////////////////////////////////////////////////////////////////////////
  //
  // MODEL LISTEN METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////


  /**
   * socket listen action
   *
   * @param  {String} id
   * @param  {Object} opts
   *
   * @call   model.listen.affiliate
   * @return {Async}
   */
  async listenAction(id, uuid, opts) {
    // / return if no id
    if (!id) return;

    // join room
    opts.socket.join(`affiliate.${id}`);

    // add to room
    return await modelHelper.listen(opts.sessionID, await Affiliate.findById(id), uuid, true);
  }

  /**
   * socket listen action
   *
   * @param  {String} id
   * @param  {Object} opts
   *
   * @call   model.deafen.affiliate
   * @return {Async}
   */
  async deafenAction(id, uuid, opts) {
    // / return if no id
    if (!id) return;

    // join room
    opts.socket.leave(`affiliate.${id}`);

    // add to room
    return await modelHelper.deafen(opts.sessionID, await Affiliate.findById(id), uuid, true);
  }
}

/**
 * Export affiliate controller
 *
 * @type {AffiliateController}
 */
module.exports = AffiliateController;
