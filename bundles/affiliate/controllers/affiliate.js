
// Require dependencies
const Grid        = require('grid');
const Controller  = require('controller');
const escapeRegex = require('escape-string-regexp');

// Require models
const Code      = model('affiliateCode');
const User      = model('user');
const Credit    = model('credit');
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
      if (!affiliate.get('_id').toString()) await affiliate.save();
    }

    // check user
    if (!affiliate) return next();

    // check user
    if (req.user) {
      // try/catch
      try {
        // check not already affiliated
        if (await req.user.get('affiliate')) return next();

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
        'maxAge' : 24 * 60 * 60 * 1000,
      });
    }

    // redirect home
    res.redirect(req.query.r || req.query.redirect || '/');
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
  async indexAction (req, res) {
    // check pending
    const affiliate = await Affiliate.findOne({
      'user.id' : req.user.get('_id').toString()
    });

    // get codes
    const codes = await Code.find({
      'state'   : 'active',
      'user.id' : req.user.get('_id').toString()
    });

    // render
    res.render('affiliate', {
      'grid'    : await (await this._grid(affiliate)).render(req),
      'codes'   : await Promise.all(codes.map((code) => code.sanitise())),
      'credits' : {
        'all'   : await this._credits(affiliate),
        'month' : await this._credits(affiliate, true)
      },
      'totals' : {
        'all'   : await this._totals(affiliate),
        'month' : await this._totals(affiliate, true)
      },
      'orders' : await Credit.where({
        'affiliate.id' : affiliate.get('_id').toString()
      }).sum('total')
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
  gridAction (req, res) {
    // return post grid request
    return await (this._grid(req.user)).post(req, res);
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
    let total = Credit.where({
      'affiliate.id' : affiliate.get('_id').toString()
    });

    // check month
    if (total) total.gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1));

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
      'affiliate.id' : affiliate.get('_id').toString()
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
  _grid(affiliate) {
    // create new grid
    const refferalGrid = new Grid();

    // set route
    refferalGrid.route('/affiliate/grid');

    // set grid model
    refferalGrid.model(Credit);

    // add grid columns
    refferalGrid.column('_id', {
      'title'  : 'ID',
      'format' : async (col) => {
        return col ? col.toString() : 'N/A';
      }
    }).column('code', {
      'sort'   : true,
      'title'  : 'Code',
      'format' : async (col) => {
        return col ? col.get('code') : 'N/A';
      }
    }).column('user', {
      'title'  : 'User',
      'format' : async (col) => {
        return col ? col.get('username') : 'N/A';
      }
    }).column('total', {
      'sort'   : true,
      'title'  : 'Order Total',
      'format' : async (col) => {
        return col ? '$' + parseFloat(col).toFixed(2) : 'N/A';
      }
    }).column('discount', {
      'sort'   : true,
      'title'  : 'Discount',
      'format' : async (col) => {
        return col ? '$' + parseFloat(col).toFixed(2) : 'N/A';
      }
    }).column('amount', {
      'sort'   : true,
      'title'  : 'Affiliate',
      'format' : async (col) => {
        return col ? '$' + parseFloat(col).toFixed(2) : 'N/A';
      }
    }).column('created_at', {
      'sort'   : true,
      'title'  : 'Created',
      'format' : async (col) => {
        return col.toLocaleDateString('en-GB', {
          'day'   : 'numeric',
          'month' : 'short',
          'year'  : 'numeric'
        });
      }
    });

    // set default sort order
    refferalGrid.sort('created_at', 1);

    // add refund grid
    refferalGrid.where({
      'affiliate.id' : affiliate.get('_id').toString()
    });

    // return grid
    return refferalGrid;
  }
}

/**
 * Export affiliate controller
 *
 * @type {AffiliateController}
 */
module.exports = AffiliateController;
