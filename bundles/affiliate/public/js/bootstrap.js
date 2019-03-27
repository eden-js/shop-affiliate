
// require dependencies
const events = require ('events');

// require local dependencies
const store = require ('default/public/js/store');

/**
 * build bootstrap class
 */
class affiliate extends events {
  /**
   * construct bootstrap class
   */
  constructor () {
    // set observable
    super ();

    // build cart store
    this.build ();
  }

  /**
   * build cart
   */
  build () {

    // eden pre
    eden.pre ('affiliate.total', this._calculate);
  }

  /**
   * calculate Total
   *
   * @param  {Object} opts
   *
   * @return {Promise}
   */
  async _calculate (opts, action) {
    // check value
    if (!action.value || !action.value.discount) return;

    // get discount value
    let discount = parseFloat ((opts.total * (action.value.discount / 100)).toFixed (2));

    // update total
    opts.total -= discount;

    // set value
    action.value.amount = discount;
  }
}

/**
 * export new bootstrap function
 *
 * @return {affiliate}
 */
exports = module.exports = new affiliate ();
