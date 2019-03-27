/**
 * Created by Awesome on 3/5/2016.
 */

// require dependencies
const Daemon = require('daemon');

// require local dependencies
const user    = model('user');
const code    = model('code');
const credit  = model('credit');
const invoice = model('invoice');

// require helpers
const balance = helper('balance');

/**
 * build affiliate Daemon
 *
 * @compute 20
 */
class AffiliateDaemon extends Daemon {
  /**
   * construct affiliate Daemon
   *
   * @param props
   */
  constructor () {
    // run super
    super();

    // set build
    this.build = this.build.bind(this);

    // bind private methods
    this._credit = this._credit.bind(this);

    // build
    this.building = this.build();
  }

  /**
   * builds affiliate bundle
   *
   * @return {Promise}
   */
  async build () {
    // on invoice change
    setInterval(async () => {
      // check invoices
      let uncredited = await invoice.ne('code', null).where({
        'credit' : null
      }).find();

      // do credits
      uncredited.forEach(this._credit);
    }, 60 * 1000);
  }

  /**
   * await credited
   *
   * @param  {invoice}  Invoice
   *
   * @return {Promise}
   */
  async _credit (Invoice) {
    // check if paid
    if (!(await Invoice.sanitise()).paid) return;

    // lock payout
    let unlock = await this.eden.lock('invoice.affiliate.' + Invoice.get('_id').toString());

    // run try/catch
    try {
      // check code
      let Code = await Invoice.get('code');

      // check credited
      if (await Invoice.get('credit') || !Code || !Code.get) return unlock();

      // let rate
      let payout = parseFloat((Invoice.get('actual') * (Code.get('rate') / 100)).toFixed(2));

      // check credit
      let Credit = await credit.findOne({
        'invoice.id' : Invoice.get('_id').toString()
      }) || new credit({
        'user'     : await Invoice.get('user'),
        'code'     : Code,
        'total'    : Invoice.get('total'),
        'actual'   : Invoice.get('actual'),
        'amount'   : payout,
        'invoice'  : Invoice,
        'discount' : Invoice.get('discount'),
        'referrer' : await Code.get('user')
      });

      // save credit
      await Credit.save();

      // set credit
      Invoice.set('credit', Credit);

      // save
      await Invoice.save();

      // check credited
      if (!Credit.get('credited')) {
        // set balance
        await balance.add(await Code.get('user'), Credit.get('amount'));

        // set credited
        Credit.set('credited', true);

        // save credit
        await Credit.save();
      }
    } catch (e) { console.log(e) }

    // unlock
    unlock();
  }
}

/**
 * export affiliate Daemon
 *
 * @type {AffiliateDaemon}
 */
module.exports = AffiliateDaemon;
