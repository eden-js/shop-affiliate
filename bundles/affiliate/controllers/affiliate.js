
// Require dependencies
const Grid        = require('grid');
const config      = require('config');
const Controller  = require('controller');
const escapeRegex = require('escape-string-regexp');

// Require models
const Code      = model('affiliateCode');
const User      = model('user');
const Credit    = model('affiliateCredit');
const Product   = model('product');
const Affiliate = model('affiliate');

// require helpers
const modelHelper     = helper('model');
const affiliateHelper = helper('affiliate');

/**
 * Build affiliate controller
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
    // check affiliate
    this.eden.router.use(async (req, res, next) => {
      // check affiliate
      if (req.cookies.affiliate && req.user && !req.user.get('affiliate.id')) {
        // set affiliate
        await req.user.lock();

        // try/catch
        try {
          // set affiliate
          req.user.set('affiliate', {
            id    : req.cookies.affiliate,
            model : 'affiliate',
          });

          // save user
          await req.user.save();
        } catch (e) {}

        // unlock
        req.user.unlock();
      }

      // run next
      next();
    });

    // do order hooks
    this.eden.pre('checkout.init', this._checkout);
    this.eden.pre('order.invoice', this._invoice);
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


  // ////////////////////////////////////////////////////////////////////////////
  //
  // Support Action
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * support affiliate action
   *
   * @param  {Request}  req
   * @param  {Response} res
   * @param  {Function} next
   *
   * @route  {GET} /a/:code
   * @return {Promise}
   */
  async supportAction(req, res, next) {
    // let affiliate
    let affiliate = null;

    // find code
    const code = await Code.where({
      code : new RegExp(['^', escapeRegex(req.params.code.toLowerCase()), '$'].join(''), 'i'),
    }).findOne();

    // get by user
    const user = await User.or({
      email : new RegExp(['^', escapeRegex(req.params.code.toLowerCase()), '$'].join(''), 'i'),
    }, {
      username : new RegExp(['^', escapeRegex(req.params.code.toLowerCase()), '$'].join(''), 'i'),
    }).findOne();

    // get by code
    if (code) {
      // get affilate
      affiliate = await Affiliate.where({
        'user.id' : code.get('user.id'),
      }).findOne();
    }
    if (!affiliate && user) {
      // get affilate
      affiliate = await Affiliate.where({
        'user.id' : user.get('_id').toString(),
      }).findOne() || new Affiliate({
        user,
      });

      // save affiliate
      if (!affiliate.get('_id')) await affiliate.save();
    }

    // check user
    if (!affiliate) return next();

    // check user
    if (req.user) {
      // try/catch
      try {
        // lock
        await req.user.lock();

        // save affiliate
        req.user.set('affiliate', affiliate);

        // save user
        await req.user.save();
      } catch (e) {}

      // check user
      req.user.unlock();
    } else {
      // set cookie
      res.cookie('affiliate', affiliate.get('_id').toString(), {
        maxAge : 24 * 60 * 60 * 1000,
      });
    }

    // redirect home
    res.redirect(req.query.r || req.query.redirect || '/');
  }

  /**
   * support affiliate action
   *
   * @param  {Request}  req
   * @param  {Response} res
   * @param  {Function} next
   *
   * @route  {GET} /affiliate/:user/get
   * @return {Promise}
   */
  async getAction(req, res, next) {
    // let affiliate
    let affiliate = null;

    // get by user
    const user = await User.findById(req.params.user);

    // get by code
    if (!affiliate && user) {
      // get affilate
      affiliate = await Affiliate.where({
        'user.id' : user.get('_id').toString(),
      }).findOne() || new Affiliate({
        user,
      });

      // save affiliate
      if (!affiliate.get('_id')) await affiliate.save();
    }

    // check user
    if (!affiliate) return next();

    // check user
    if (req.user) {
      // try/catch
      try {
        // lock
        await req.user.lock();

        // save affiliate
        req.user.set('affiliate', affiliate);

        // save user
        await req.user.save();
      } catch (e) {}

      // check user
      req.user.unlock();
    } else {
      // set cookie
      res.cookie('affiliate', affiliate.get('_id').toString(), {
        maxAge : 24 * 60 * 60 * 1000,
      });
    }

    // return json
    return res.json({
      result  : await affiliate.sanitise(),
      success : true,
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
   * @fail   /login
   * @route  {get} /affiliate
   * @return {Promise}
   */
  async indexAction(req, res) {
    // check pending
    const affiliate = await Affiliate.findOne({
      'user.id' : req.user.get('_id').toString(),
    });

    // get codes
    const codes = await Code.find({
      state     : 'active',
      'user.id' : req.user.get('_id').toString(),
    });

    // render
    res.render('affiliate', {
      grid    : await (await this._grid(req, affiliate)).render(req),
      codes   : await Promise.all(codes.map(code => code.sanitise())),
      credits : {
        all   : await this._credits(affiliate),
        month : await this._credits(affiliate, true),
      },
      totals : {
        all   : await this._totals(affiliate),
        month : await this._totals(affiliate, true),
      },
      orders : await Credit.where({
        'affiliate.id' : affiliate.get('_id').toString(),
      }).sum('total'),
    });
  }

  /**
   * user grid action
   *
   * @param req
   * @param res
   *
   * @acl    true
   * @fail   /
   * @route {post} /affiliate/grid
   */
  async gridAction(req, res) {
    // check pending
    const affiliate = await Affiliate.findOne({
      'user.id' : req.user.get('_id').toString(),
    });

    // return post grid request
    return await (this._grid(req, affiliate)).post(req, res);
  }

  /**
   * Checkout order
   *
   * @param  {Object} order
   */
  async _checkout(order) {
    // get user
    const user = await order.get('user');

    // Add action
    order.set('actions.affiliate', {
      type     : 'affiliate',
      data     : {},
      value    : user && await user.get('affiliate') ? await (await user.get('affiliate')).sanitise() : {},
      priority : 40,
    });
  }

  /**
   * On shipping
   *
   * @param  {order}   Order
   * @param  {Object}  action
   *
   * @return {Promise}
   */
  async _invoice(order, invoice) {
    // Augment order
    const products = await order.get('products');

    // Find shipping
    const action = order.get('actions.affiliate');

    // Check action exists
    if (!action || !action.value || !action.value.id) return;

    // set affiliate
    const affiliate = await Affiliate.findById(action.value.id);

    // Get discount value
    const discount = parseFloat(invoice.get('lines').reduce((accum, line) => {
      // get product
      const product = products.find(p => p.get('_id').toString() === line.product);

      // return accum
      if (!product) return accum;

      // check product
      line.discount = parseFloat(((line.total || 0) * (parseInt(affiliate.get(`rates.${product.get('type')}.discount`) || config.get('shop.discount') || 0, 10) / 100)).toFixed(2)) || 0;

      // return added
      return line.discount + accum;
    }, 0));

    // Log
    invoice.set('total', invoice.get('total') - discount);
    invoice.set('actual', invoice.get('total') + discount);
    invoice.set('discount', discount);
    invoice.set('affiliate', affiliate);

    // Save invoice
    await invoice.save();
  }

  /**
   * returns total case opens value
   *
   * @param  {Affiliate} affiliate
   * @param  {Boolean}   month
   *
   * @return {Promise}
   */
  async _credits(affiliate, month) {
    // get total
    const total = Credit.where({
      'affiliate.id' : affiliate.get('_id').toString(),
    });

    // check month
    if (month) total.gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    // total
    return await total.sum('amount');
  }

  /**
   * gets referrals count
   *
   * @param  {Affiliate} affiliate
   * @param  {Boolean}   month
   *
   * @return {Promise}
   */
  async _totals(affiliate, month) {
    // return where
    let total = Credit.where({
      'affiliate.id' : affiliate.get('_id').toString(),
    });

    // check where
    if (month) total = total.gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    // return count
    return await total.count();
  }

  /**
   * renders grid
   *
   * @return {grid}
   */
  _grid(req, affiliate) {
    // create new grid
    const creditGrid = new Grid();

    // set route
    creditGrid.route('/affiliate/grid');

    // set grid model
    creditGrid.model(Credit);

    // add grid columns
    creditGrid.column('_id', {
      title  : 'ID',
      format : async (col) => {
        return col ? col.toString() : 'N/A';
      },
    }).column('user', {
      sort   : true,
      title  : 'User',
      format : async (col) => {
        return col ? col.name() : 'N/A';
      },
    }).column('amount', {
      sort   : true,
      title  : 'Affiliate Amount',
      format : async (col) => {
        return col ? `$${parseFloat(col).toFixed(2)}` : 'N/A';
      },
    })
      .column('order', {
        sort   : true,
        title  : 'Order Total',
        format : async (col) => {
          // get invoice
          const invoice = col ? await col.get('invoice') : null;

          // return value
          return invoice ? `$${parseFloat(invoice.get('total')).toFixed(2)}` : 'N/A';
        },
      })
      .column('lines', {
        sort   : true,
        title  : 'Lines',
        format : async (col, row) => {
          // get invoice
          const lines = await row.get('lines');

          // get products
          return (await Promise.all(lines.map(async (line) => {
            // get product
            const product = await Product.findById(line.product);

            // return value
            return `${line.qty || 1}x <a href="/product/${product.get('sku')}" target="_blank">${product.get(`title.${req.language}`)}</a>`;
          }))).join(',<br>');
        },
        export : async (col, row) => {
          // get invoice
          const lines = await row.get('lines');

          // get products
          return (await Promise.all(lines.map(async (line) => {
            // get product
            const product = await Product.findById(line.product);

            // return value
            return `${line.qty || 1}x ${product.get(`title.${req.language}`)}`;
          }))).join(', ');
        },
      })
      .column('created_at', {
        sort   : true,
        title  : 'Created',
        format : async (col) => {
          return col.toLocaleDateString('en-GB', {
            day   : 'numeric',
            month : 'short',
            year  : 'numeric',
          });
        },
      });

    // set default sort order
    creditGrid.sort('created_at', -1);

    // add refund grid
    creditGrid.where({
      'affiliate.id' : affiliate.get('_id').toString(),
    });

    // return grid
    return creditGrid;
  }
}

/**
 * Export affiliate controller
 *
 * @type {AffiliateController}
 */
module.exports = AffiliateController;
