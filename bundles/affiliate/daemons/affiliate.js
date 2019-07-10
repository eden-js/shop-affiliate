
// import dependencies
const Daemon = require('daemon');
const config = require('config');

// require models
const Credit = model('affiliateCredit');

// require helpers
const balanceHelper = helper('balance');

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
      // check order
      if (await order.get('affiliate')) return;

      // get user
      const user = await order.get('user');
      const products = await order.get('products');
      const affiliate = user ? await user.get('affiliate') : null;

      // no affiliate
      if (!user || !affiliate) return;

      // check affiliate
      if (affiliate.get('active') !== true) return;

      // set affiliate user
      const affiliateUser = Array.isArray(await affiliate.get('user')) ? (await affiliate.get('user'))[0] : await affiliate.get('user');

      // add credit
      const credit = new Credit({
        user,
        order,
        affiliate,

        amount : parseFloat(order.get('lines').reduce((accum, line) => {
          // get product
          const product = products.find(p => p.get('_id').toString() === line.product);

          // return accum
          if (!product) return accum;

          // check product
          line.affiliate = parseFloat(((line.total || 0) * (parseInt(affiliate.get(`rates.${product.get('type')}.affiliate`) || config.get('shop.affiliate') || 0, 10) / 100)).toFixed(2)) || 0;

          // return added
          return line.affiliate + accum;
        }, 0)),

        discount : parseFloat(order.get('lines').reduce((accum, line) => {
          // get product
          const product = products.find(p => p.get('_id').toString() === line.product);

          // return accum
          if (!product) return accum;

          // check product
          line.discount = parseFloat(((line.total || 0) * (parseInt(affiliate.get(`rates.${product.get('type')}.discount`) || config.get('shop.discount') || 0, 10) / 100)).toFixed(2)) || 0;

          // return added
          return line.discount + accum;
        }, 0)),
      });

      // get lines
      credit.set('lines', order.get('lines'));

      // save credit
      await credit.save();

      // set values
      order.set('affiliate', credit);
      order.set('expense.discount', credit.get('discount') || 0);
      order.set('expense.affiliate', credit.get('amount') || 0);
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
      await balanceHelper.add(affiliateUser, credit.get('amount'));
    });
  }
}

/**
 * export built affiliate daemon
 *
 * @type {AllAffiliateDaemon}
 */
module.exports = AllAffiliateDaemon;
