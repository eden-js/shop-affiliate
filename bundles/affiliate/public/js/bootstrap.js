
// Require dependencies
const Events = require('events');

/**
 * Build bootstrap class
 */
class Affiliate extends Events {
  /**
   * Construct bootstrap class
   */
  constructor() {
    // Set observable
    super();

    // bind methods
    this.build = this.build.bind(this);

    // Build cart store
    this.building = this.build();
  }

  /**
   * Build cart
   */
  build() {
    // Eden pre
    eden.pre('checkout.total', this._calculate);
  }

  /**
   * Calculate Total
   *
   * @param  {Object} opts
   *
   * @return {Promise}
   */
  async _calculate(opts) {
    // get affiliate
    const affiliate = ((opts.actions.affiliate || {}).value || {});

    // return on value
    if (!affiliate.id) return;

    // calculate discount
    const discount = parseFloat(opts.lines.reduce((accum, line) => {
      // get product
      const product = opts.products.find(p => p.id === line.product);

      // return accum
      if (!product) return accum;

      // check product
      const d = parseFloat(((line.total || 0) * (parseInt(((affiliate.rates || {})[product.type] || {}).discount || 0, 10) / 100)).toFixed(2)) || 0;

      // return added
      return d + accum;
    }, 0));

    // set discount
    affiliate.discount = discount;

    // take 5 bucks off
    opts.total -= discount;
    opts.discount = discount;
  }
}

/**
 * Export new bootstrap function
 *
 * @return {affiliate}
 */
exports = module.exports = new Affiliate();
