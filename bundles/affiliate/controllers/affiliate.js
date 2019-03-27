
// Require dependencies
const Controller  = require('controller');
const escapeRegex = require('escape-string-regexp');

// Require models
const Code      = model('affiliateCode');
const User      = model('user');
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
}

/**
 * Export affiliate controller
 *
 * @type {AffiliateController}
 */
module.exports = AffiliateController;
