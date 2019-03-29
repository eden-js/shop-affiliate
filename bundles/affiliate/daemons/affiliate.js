
// import dependencies
const Daemon = require('daemon');

// require models
const Credit = model('affiliateCredit');

// require helpers
const balanceHelper   = helper('balance');
const affiliateHelper = helper('affiliate');

/**
 * extend affiliate Daemon
 *
 * @extends {Daemon}
 */
class AllAffiliateDaemon extends Daemon {
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
    // pre complete order
    this.eden.pre('order.complete', async (order) => {
      // get user
      const user = await order.get('user');
      const products = await order.get('products');
      const affiliate = user ? await user.get('affiliate') : null;

      // no affiliate
      if (!user || !affiliate) return;

      // check affiliate
      if (affiliate.get('active') !== true) return;

      // check affiliate percentage
      if (!affiliate.get('percentage')) return;

      // add credit
      const credit = new Credit({
        user,
        order,
        affiliate,

        lines  : await order.get('lines'),
        amount : parseFloat((await order.get('lines')).reduce((accum, line) => {
          // get product
          const product = products.find(p => p.get('_id').toString() === line.product);

          // return accum
          if (!product) return accum;

          // check product
          return parseFloat(((line.total || 0) * ((affiliate.get(`rates.${product.get('type')}`) || 0) / 100)).toFixed(2)) + accum;
        }, 0)),
      });

      // save credit
      await credit.save();

      // set values
      order.set('affiliate', credit);
      order.set('expense.affiliate', credit.get('amount'));
      order.set('expense.total', Object.keys(order.get('expense')).reduce((accum, key) => {
        // check total
        if (key === 'total') return accum;

        // add to accum
        accum += order.get(`expense.${key}`);

        // return accumulator
        return accum;
      }, 0));

      // save order
      await order.save();

      // add to balance
      await balanceHelper.add((await affiliate.get('user')), credit.get('amount'));
    });
  }
}

/**
 * export built affiliate daemon
 *
 * @type {AllAffiliateDaemon}
 */
module.exports = AllAffiliateDaemon;
