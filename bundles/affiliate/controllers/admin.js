
// Require dependencies
const Grid        = require('grid');
const config      = require('config');
const Controller  = require('controller');
const escapeRegex = require('escape-string-regexp');

// Require models
const Block     = model('block');
const Credit    = model('affiliateCredit');
const Affiliate = model('affiliate');

// require helpers
const formHelper      = helper('form');
const fieldHelper     = helper('form/field');
const blockHelper     = helper('cms/block');
const affiliateHelper = helper('affiliate');

/**
 * Build affiliate controller
 *
 * @acl   admin
 * @fail  next
 * @mount /admin/affiliate
 */
class AffiliateAdminController extends Controller {
  /**
   * Construct affiliate Admin Controller
   */
  constructor() {
    // run super
    super();

    // bind build methods
    this.build = this.build.bind(this);

    // bind methods
    this.gridAction = this.gridAction.bind(this);
    this.indexAction = this.indexAction.bind(this);
    this.createAction = this.createAction.bind(this);
    this.updateAction = this.updateAction.bind(this);
    this.removeAction = this.removeAction.bind(this);
    this.createSubmitAction = this.createSubmitAction.bind(this);
    this.updateSubmitAction = this.updateSubmitAction.bind(this);
    this.removeSubmitAction = this.removeSubmitAction.bind(this);

    // bind private methods
    this._grid = this._grid.bind(this);

    // set building
    this.building = this.build();
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // BUILD METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * build affiliate admin controller
   */
  build() {
    //
    // REGISTER BLOCKS
    //

    // register simple block
    blockHelper.block('admin.affiliate.grid', {
      acl         : ['admin.affiliate'],
      for         : ['admin'],
      title       : 'Affiliate Grid',
      description : 'Affiliate Grid block',
    }, async (req, block) => {
      // get notes block from db
      const blockModel = await Block.findOne({
        uuid : block.uuid,
      }) || new Block({
        uuid : block.uuid,
        type : block.type,
      });

      // create new req
      const fauxReq = {
        query : blockModel.get('state') || {},
      };

      // return
      return {
        tag   : 'grid',
        name  : 'Affiliate',
        grid  : await (await this._grid(req)).render(fauxReq),
        class : blockModel.get('class') || null,
        title : blockModel.get('title') || '',
      };
    }, async (req, block) => {
      // get notes block from db
      const blockModel = await Block.findOne({
        uuid : block.uuid,
      }) || new Block({
        uuid : block.uuid,
        type : block.type,
      });

      // set data
      blockModel.set('class', req.body.data.class);
      blockModel.set('state', req.body.data.state);
      blockModel.set('title', req.body.data.title);

      // save block
      await blockModel.save(req.user);
    });

    //
    // REGISTER FIELDS
    //

    // register simple field
    fieldHelper.field('admin.affiliate', {
      for         : ['admin'],
      title       : 'Affiliate',
      description : 'Affiliate Field',
    }, async (req, field, value) => {
      // set tag
      field.tag = 'affiliate';
      field.value = value ? (Array.isArray(value) ? await Promise.all(value.map(item => item.sanitise())) : await value.sanitise()) : null;
      // return
      return field;
    }, async (req, field) => {
      // save field
    }, async (req, field, value, old) => {
      // set value
      try {
        // set value
        value = JSON.parse(value);
      } catch (e) {}

      // check value
      if (!Array.isArray(value)) value = [value];

      // return value map
      return await Promise.all((value || []).filter(val => val).map(async (val, i) => {
        // run try catch
        try {
          // buffer affiliate
          const affiliate = await Affiliate.findById(val);

          // check affiliate
          if (affiliate) return affiliate;

          // return null
          return null;
        } catch (e) {
          // return old
          return old[i];
        }
      }));
    });
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // CRUD METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * Index action
   *
   * @param {Request}  req
   * @param {Response} res
   *
   * @icon     fa fa-building
   * @menu     {ADMIN} Affiliates
   * @title    Affiliate Administration
   * @route    {get} /
   * @layout   admin
   * @priority 10
   */
  async indexAction(req, res) {
    // Render grid
    res.render('affiliate/admin', {
      grid : await (await this._grid(req)).render(req),
    });
  }

  /**
   * Add/edit action
   *
   * @param {Request}  req
   * @param {Response} res
   *
   * @route    {get} /create
   * @layout   admin
   * @return   {*}
   * @priority 12
   */
  createAction(req, res) {
    // Return update action
    return this.updateAction(req, res);
  }

  /**
   * Update action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {get} /:id/update
   * @layout  admin
   */
  async updateAction(req, res) {
    // Set website variable
    let affiliate = new Affiliate();
    let create = true;

    // Check for website model
    if (req.params.id) {
      // Load by id
      affiliate = await Affiliate.findById(req.params.id);
      create = false;
    }

    // get form
    const form = await formHelper.get('edenjs.shop.affiliate');

    // digest into form
    const sanitised = await formHelper.render(req, form, await Promise.all(form.get('fields').map(async (field) => {
      // return fields map
      return {
        uuid  : field.uuid,
        value : await affiliate.get(field.name || field.uuid),
      };
    })));

    // get form
    if (!form.get('_id')) res.form('edenjs.shop.affiliate');

    // Render page
    res.render('affiliate/admin/update', {
      item    : await affiliate.sanitise(),
      form    : sanitised,
      title   : create ? 'Create affiliate' : `Update ${affiliate.get('_id').toString()}`,
      fields  : config.get('shop.affiliate.fields'),
      credits : {
        all   : create ? 0 : await this._credits(affiliate),
        month : create ? 0 : await this._credits(affiliate, true),
      },
      totals : {
        all   : create ? 0 : await this._totals(affiliate),
        month : create ? 0 : await this._totals(affiliate, true),
      },
      orders : create ? 0 : await Credit.where({
        'affiliate.id' : affiliate.get('_id').toString(),
      }).sum('total'),
    });
  }

  /**
   * Create submit action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {post} /create
   * @return  {*}
   * @layout  admin
   * @upload  {single} image
   */
  createSubmitAction(req, res) {
    // Return update action
    return this.updateSubmitAction(req, res);
  }

  /**
   * Add/edit action
   *
   * @param {Request}  req
   * @param {Response} res
   * @param {Function} next
   *
   * @route   {post} /:id/update
   * @layout  admin
   */
  async updateSubmitAction(req, res, next) {
    // Set website variable
    let create = true;
    let affiliate = new Affiliate();

    // Check for website model
    if (req.params.id) {
      // Load by id
      affiliate = await Affiliate.findById(req.params.id);
      create = false;
    }

    // get form
    const form = await formHelper.get('edenjs.shop.affiliate');

    // digest into form
    const fields = await formHelper.submit(req, form, await Promise.all(form.get('fields').map(async (field) => {
      // return fields map
      return {
        uuid  : field.uuid,
        value : await affiliate.get(field.name || field.uuid),
      };
    })));

    // loop fields
    for (const field of fields) {
      // set value
      affiliate.set(field.name || field.uuid, field.value);
    }

    // Save affiliate
    await affiliate.save(req.user);

    // return update action
    return res.redirect(`/admin/affiliate/${affiliate.get('_id').toString()}/update`);
  }

  /**
   * Delete action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {get} /:id/remove
   * @layout  admin
   */
  async removeAction(req, res) {
    // Set website variable
    let affiliate = false;

    // Check for website model
    if (req.params.id) {
      // Load user
      affiliate = await Affiliate.findById(req.params.id);
    }

    // Render page
    res.render('affiliate/admin/remove', {
      item  : await affiliate.sanitise(),
      title : `Remove ${affiliate.get('_id').toString()}`,
    });
  }

  /**
   * Delete action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {post} /:id/remove
   * @title   Remove Affiliate
   * @layout  admin
   */
  async removeSubmitAction(req, res) {
    // Set website variable
    let affiliate = false;

    // Check for website model
    if (req.params.id) {
      // Load user
      affiliate = await Affiliate.findById(req.params.id);
    }

    // Alert Removed
    req.alert('success', `Successfully removed ${affiliate.get('_id').toString()}`);

    // Delete website
    await affiliate.remove(req.user);

    // Render index
    return this.indexAction(req, res);
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // QUERY METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * index action
   *
   * @param req
   * @param res
   *
   * @acl   admin
   * @fail  next
   * @route {GET} /query
   */
  async queryAction(req, res) {
    // find children
    let affiliates = await Affiliate;

    // set query
    if (req.query.q) {
      affiliates = affiliates.where({
        name : new RegExp(escapeRegex(req.query.q || ''), 'i'),
      });
    }

    // add roles
    affiliates = await affiliates.skip(((parseInt(req.query.page, 10) || 1) - 1) * 20).limit(20).sort('name', 1)
      .find();

    // get children
    res.json((await Promise.all(affiliates.map(affiliate => affiliate.sanitise()))).map((sanitised) => {
      // return object
      return {
        text  : sanitised.name,
        data  : sanitised,
        value : sanitised.id,
      };
    }));
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // GRID METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * User grid action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route  {post} /grid
   * @return {*}
   */
  async gridAction(req, res) {
    // Return post grid request
    return (await this._grid(req)).post(req, res);
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
   * Renders grid
   *
   * @param {Request} req
   *
   * @return {grid}
   */
  async _grid(req) {
    // Create new grid
    const affiliateGrid = new Grid();

    // Set route
    affiliateGrid.route('/admin/affiliate/grid');

    // get form
    const form = await formHelper.get('edenjs.shop.affiliate');

    // Set grid model
    affiliateGrid.id('edenjs.shop.affiliate');
    affiliateGrid.model(Affiliate);
    affiliateGrid.models(true);

    // Add grid columns
    affiliateGrid.column('_id', {
      sort     : true,
      title    : 'Id',
      priority : 100,
    });

    // branch fields
    await Promise.all((form.get('_id') ? form.get('fields') : config.get('shop.affiliate.fields').slice(0)).map(async (field, i) => {
      // set found
      const found = config.get('shop.affiliate.fields').find(f => f.name === field.name);

      // add config field
      await formHelper.column(req, form, affiliateGrid, field, {
        hidden   : !(found && found.grid),
        priority : 100 - i,
      });
    }));

    // add extra columns
    affiliateGrid.column('updated_at', {
      tag      : 'grid-date',
      sort     : true,
      title    : 'Updated',
      priority : 4,
    }).column('created_at', {
      tag      : 'grid-date',
      sort     : true,
      title    : 'Created',
      priority : 3,
    }).column('actions', {
      tag      : 'affiliate-actions',
      type     : false,
      width    : '1%',
      title    : 'Actions',
      priority : 1,
    });

    // branch filters
    config.get('shop.affiliate.fields').slice(0).filter(field => field.grid).forEach((field) => {
      // add config field
      affiliateGrid.filter(field.name, {
        type  : 'text',
        title : field.label,
        query : (param) => {
          // Another where
          affiliateGrid.match(field.name, new RegExp(escapeRegex(param.toString().toLowerCase()), 'i'));
        },
      });
    });

    // Set default sort order
    affiliateGrid.sort('created_at', 1);

    // Return grid
    return affiliateGrid;
  }
}

/**
 * Export affiliate controller
 *
 * @type {AffiliateAdminController}
 */
module.exports = AffiliateAdminController;
