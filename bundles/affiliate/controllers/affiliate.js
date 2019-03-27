/**
 * Created by Awesome on 3/5/2016.
 */

// require dependencies
const grid       = require('grid');
const alert      = require('alert');
const moment     = require('moment');
const controller = require('controller');

// require local dependencies
const user    = model('user');
const code    = model('code');
const credit  = model('credit');
const invoice = model('invoice');

// require helpers
const balance = helper('balance');

/**
 * build affiliate controller
 *
 * @mount /affiliate
 */
class affiliateController extends controller {
  /**
   * construct affiliate controller
   *
   * @param props
   */
  constructor () {
    // run super
    super ();

    // set build
    this.build = this.build.bind(this);

    // build
    this.building = this.build();
  }

  /**
   * builds affiliate bundle
   *
   * @return {Promise}
   */
  async build () {
    // checkout hooks
    this.eden.pre('checkout.init',   this._checkout);
    this.eden.pre('order.invoice',   this._invoice);
    this.eden.pre('order.affiliate', this._affiliate);

  }

  /**
   * set index
   *
   * @title  Affiliate
   * @param  {Request}   req
   * @param  {Response}  res
   *
   * @acl    true
   * @fail   /login
   * @route  {get} /
   * @layout no-user
   * @return {Promise}
   */
  async indexAction (req, res) {
    // check pending
    let Pending = await code.findOne ({
      'state'   : 'pending',
      'user.id' : req.user.get ('_id').toString ()
    });

    // get codes
    let Codes = await code.find ({
      'state'   : 'active',
      'user.id' : req.user.get ('_id').toString ()
    });

    // check Codes
    if (!Codes || !Codes.length) {
      // check pending
      if (Pending) return this.pendingAction (...arguments);

      // return apply
      return this.applyAction (...arguments);
    }

    // render
    res.render ('affiliate', {
      'grid'    : await this._grid(req.user).render(),
      'codes'   : await Promise.all(Codes.map((Code) => Code.sanitise())),
      'credits' : {
        'all'   : await this._credits(req.user),
        'month' : await this._credits(req.user, true)
      },
      'totals' : {
        'all'   : await this._totals(req.user),
        'month' : await this._totals(req.user, true)
      },
      'discount' : await credit.where({
        'referrer.id' : req.user.get('_id').toString()
      }).sum('discount'),
      'orders' : await credit.where({
        'referrer.id' : req.user.get('_id').toString()
      }).sum('total')
    });
  }

  /**
   * get code from frontend
   *
   * @param  {String} code
   * @param  {Object} opts
   *
   * @call   checkout.code
   * @return {Promise}
   */
  async checkoutAction (text, opts) {
    // find code
    let Code = await code.findOne ({
      'code'  : new RegExp (['^', text, '$'].join (''), 'i'),
      'state' : 'active'
    });

    // check code
    if (!Code) {
      // send alert
      return opts.alert('error', 'This affiliate code does not exist');
    }

    // check code
    if (opts.user && await Code.get ('user') && opts.user.get ('_id').toString () === (await Code.get ('user')).get ('_id').toString ()) {
      // return error
      //alert.socket (opts.socket, 'error', 'You cannot use your own affilaite code');

      // return null
      //return null;
    }

    // check code used
    return await Code.sanitise ();
  }

  /**
   * set index
   *
   * @title  Affiliate
   * @param  {Request}   req
   * @param  {Response}  res
   *
   * @return {Promise}
   */
  async pendingAction (req, res) {

    // render appliaction page
    res.render ('affiliate/pending', {
      'layout' : 'no-user'
    });
  }

  /**
   * set index
   *
   * @title  Affiliate
   * @param  {Request}   req
   * @param  {Response}  res
   *
   * @acl    true
   * @fail   /
   * @route  {get} /apply
   * @return {Promise}
   */
  async applyAction (req, res) {

    // render appliaction page
    res.render ('affiliate/application', {
      'layout' : 'no-user'
    });
  }

  /**
   * set index
   *
   * @title  Affiliate
   * @param  {Request}   req
   * @param  {Response}  res
   *
   * @acl    true
   * @fail   /
   * @route  {post} /application
   * @layout no-user
   * @return {Promise}
   */
  async applySubmitAction (req, res) {
    // create new code
    let Code = new code({
      'code'     : req.body.code,
      'user'     : req.user,
      'rate'     : req.body.rate === 'custom' ? 0 : parseInt (req.body.rate) || 0,
      'state'    : 'pending',
      'notes'    : req.body.notes,
      'discount' : req.body.discount === 'custom' ? 0 : parseInt (req.body.discount) || 0,
    });

    // set first and last
    req.user.set('last',  req.body.last || req.user.get ('last'));
    req.user.set('first', req.body.first || req.user.get ('first'));

    // save user
    await req.user.save();

    // find code
    let Check = await code.findOne ({
      'code' : new RegExp (['^', req.body.code, '$'].join (''), 'i')
    });

    // load check
    if (Check) {
      // return error
      req.alert('error', 'This referral code has already been used');

      // done
      return res.render('affiliate/application', {
        'layout' : 'no-user'
      });
    }

    // save code
    await Code.save();

    // send alert
    req.alert('success', 'Successfully applied to our affiliate system, please check your email for the result (usually assessed within 24 hours)');

    // render appliaction page
    res.redirect('/affiliate');
  }

  /**
   * user grid action
   *
   * @param req
   * @param res
   *
   * @acl    true
   * @fail   /
   * @route {post} /grid
   */
  gridAction (req, res) {
    // return post grid request
    return this._grid (req.user).post (req, res);
  }

  /**
   * gets referrals count
   *
   * @param  {user}     User
   * @param  {Boolean}  month
   *
   * @return {Promise}
   */
  async _totals (User, month) {
    // return where
    let Total = credit.where({
      'referrer.id' : User.get('_id').toString()
    });

    // check where
    if (month) Total = Total.gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    // return count
    return await Total.count();
  }

  /**
   * checkout order
   *
   * @param  {Object} order
   */
  async _checkout (order) {
    // add action
    order.set('actions.affiliate', {
      'type'     : 'affiliate',
      'data'     : {},
      'priority' : 40
    });
  }

  /**
   * on shipping
   *
   * @param  {order}   Order
   * @param  {Object}  action
   *
   * @return {Promise}
   */
  async _invoice (Order, Invoice) {
    // augment order
    let actions = Order.get('actions');

    // find shipping
    let action = actions.affiliate;

    // check action exists
    if (!action || !action.value || !action.value.discount) return;

    // get discount value
    let discount = parseFloat((Invoice.get('total') * action.value.discount).toFixed(2));

    // log
    Invoice.set('code', {
      'id'    : action.value.id,
      'model' : 'code'
    });
    Invoice.set('total',    Invoice.get ('total') - discount);
    Invoice.set('actual',   Invoice.get ('total') + discount);
    Invoice.set('discount', discount);

    // save invoice
    await Invoice.save();
  }

  /**
   * on shipping
   *
   * @param  {order}   Order
   * @param  {Object}  action
   *
   * @return {Promise}
   */
  async _affiliate (Order, action) {
    // set shipping
    let Invoice = await Order.get('invoice');

    // check action value
    if (!action.value || !action.value.id) return;

    // check value
    let Code = await code.findById(action.value.id);

    // set error if not active
    if (Code.get ('state') !== 'active') return Order.set('error', 'Coupon code not currently active');

    // check if user
    if (await Order.get('user') && await Code.get('user') && (await Order.get('user')).get('_id').toString() === (await Code.get('user')).get ('_id').toString()) {
      // return set error
      //return Order.set ('error', 'You cannot use your own coupon code');
    }

    // set value
    let discount = (Code.get('discount') / 100);

    // add shipping price
    action.value = {
      'id'       : Code.get('_id').toString(),
      'discount' : discount
    };
  }

  /**
   * returns total case opens value
   *
   * @param  {user}  User
   *
   * @return {Promise}
   */
  async _credits (User, month) {
    // get total
    let total = credit.where({
      'referrer.id' : User.get ('_id').toString ()
    });

    // check month
    if (total) total.gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    // total
    return await total.sum('amount');
  }

  /**
   * renders grid
   *
   * @return {grid}
   */
  _grid (User) {
    // create new grid
    let refferalGrid = new grid ();

    // set route
    refferalGrid.route ('/affiliate/grid');

    // set grid model
    refferalGrid.model (credit);

    // add grid columns
    refferalGrid.column ('_id', {
      'title'  : 'ID',
      'format' : async (col) => {
        return col ? col.toString () : 'N/A';
      }
    }).column ('code', {
      'sort'   : true,
      'title'  : 'Code',
      'format' : async (col) => {
        return col ? col.get('code') : 'N/A';
      }
    }).column ('user', {
      'title'  : 'User',
      'format' : async (col) => {
        return col ? col.get ('username') : 'N/A';
      }
    }).column ('total', {
      'sort'   : true,
      'title'  : 'Order Total',
      'format' : async (col) => {
        return col ? '$' + parseFloat(col).toFixed(2) : 'N/A';
      }
    }).column ('discount', {
      'sort'   : true,
      'title'  : 'Discount',
      'format' : async (col) => {
        return col ? '$' + parseFloat(col).toFixed(2) : 'N/A';
      }
    }).column ('amount', {
      'sort'   : true,
      'title'  : 'Affiliate',
      'format' : async (col) => {
        return col ? '$' + parseFloat(col).toFixed(2) : 'N/A';
      }
    }).column ('created_at', {
      'sort'   : true,
      'title'  : 'Created',
      'format' : async (col) => {
        return col.toLocaleDateString ('en-GB', {
          'day'   : 'numeric',
          'month' : 'short',
          'year'  : 'numeric'
        });
      }
    });

    // set default sort order
    refferalGrid.sort ('created_at', 1);

    // add refund grid
    refferalGrid.where ({
      'referrer.id' : User.get ('_id').toString ()
    });

    // return grid
    return refferalGrid;
  }
}

/**
 * export affiliate controller
 *
 * @type {affiliateController}
 */
module.exports = affiliateController;
