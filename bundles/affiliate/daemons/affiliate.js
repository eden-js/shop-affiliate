
// import dependencies
const Daemon = require('daemon');

// require helpers
const affiliateHelper = helper('affiliate');

/**
 * extend affiliate Daemon
 *
 * @cluster back
 *
 * @extends {Daemon}
 */
class AffiliateDaemon extends Daemon {
  /**
   * construct Affiliate Daemon
   */
  constructor() {
    // run super
    super();

    // bind build method
    this.build = this.build.bind(this);

    // build
    this.building = this.build();
  }

  /**
   * build Affiliate Daemon
   */
  async build() {

  }
}

/**
 * export built affiliate daemon
 *
 * @type {affiliateDaemon}
 */
module.exports = AffiliateDaemon;
