
// require dependencies
const base = require ('helper');

// require models
const credit   = model ('credit');
const referral = model ('referral');

// require helpers
const balance = helper ('balance');

/**
 * construct affiliate helper
 */
class affiliateHelper extends base {

  /**
   * construct affiliate helper
   */
  constructor () {
    // run super
    super (...arguments);

    // bind methods
    this.bet = this.bet.bind (this);
  }

  /**
   * add on user bet
   *
   * @param  {user}  User
   * @param  {Float} amount
   *
   * @return {Promise}
   */
  async bet (User, amount) {
    // open lock
    let done = await this.eden.lock ('affiliate.' + User.get ('_id').toString (), true);

    // add to referrer
    let Referrer = await User.get ('referrer');

    // get credit
    let credit = (Math.floor (amount) / 100);

    // check referrer
    if (Referrer) {
      // set balance
      await balance.add (Referrer, credit);

      // load referral
      let Referral = await referral.findOne ({
        'user.id'     : User.get ('_id').toString (),
        'referrer.id' : Referrer.get ('_id').toString (),
      });

      // check referral
      if (Referral) {
        // get current day
        let Midnight = new Date ();

        // set midnight
        Midnight.setHours (0, 0, 0, 0);

        // check credit
        let Credit = await credit.findOne ({
          'date'    : Midnight,
          'user.id' : Referral.get ('_id').toString (),
        }) || new credit ({
          'date' : Midnight,
          'user' : Referral
        });

        // set credit
        Credit.set ('amount', parseFloat ((parseFloat (Referral.get ('amount') || 0) + credit).toFixed (2)));

        // check value
        Referral.set ('amount', parseFloat ((parseFloat (Referral.get ('amount') || 0) + credit).toFixed (2)));

        // save referral
        await Credit.save ();
        await Referral.save ();
      }
    }

    // unlock
    done ();
  }
}

/**
 * eport built affiliate helper
 *
 * @type {affiliateHelper}
 */
exports = module.exports = new affiliateHelper ();
