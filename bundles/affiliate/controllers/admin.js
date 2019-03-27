/**
 * Created by Awesome on 3/5/2016.
 */

// use strict
'use strict';

// require dependencies
const grid       = require ('grid');
const alert      = require ('alert');
const moment     = require ('moment');
const controller = require ('controller');

// require local dependencies
const user   = model ('user');
const code   = model ('code');
const credit = model ('credit');

// require helpers
const balance = helper ('balance');

/**
 * build affiliate controller
 *
 * @acl   affiliate.admin
 * @fail  /
 * @mount /admin/affiliate
 */
class adminController extends controller {
  /**
   * construct affiliate controller
   *
   * @param props
   */
  constructor () {
    // run super
    super (...arguments);

  }

  /**
   * set index
   *
   * @title  Affiliate
   * @param  {Request}   req
   * @param  {Response}  res
   *
   * @icon   fa fa-money-bill-wave
   * @menu   {ADMIN} Affiliates
   * @route  {get} /
   * @layout admin
   * @return {Promise}
   */
  async indexAction (req, res) {
    // render
    res.render ('affiliate/admin', {
      'grid' : await this._grid ().render (req)
    });
  }

  /**
   * add/edit action
   *
   * @param req
   * @param res
   *
   * @route    {get} /create
   * @layout   admin
   * @priority 12
   */
  createAction (req, res) {
    // return update action
    return this.updateAction (req, res);
  }

  /**
   * update action
   *
   * @param req
   * @param res
   *
   * @route   {get} /:id/update
   * @layout  admin
   */
  async updateAction (req, res) {
    // set website variable
    let Code   = new code ();
    let create = true;

    // check for website model
    if (req.params.id) {
      // load by id
      Code   = await code.findById (req.params.id);
      create = false;
    }

    // render page
    res.render ('affiliate/admin/update', {
      'code'  : await Code.sanitise (),
      'title' : create ? 'Create Code' : 'Update ' + Code.get ('_id').toString (),
    });
  }

  /**
   * create submit action
   *
   * @param req
   * @param res
   *
   * @route   {post} /create
   * @layout  admin
   */
  createSubmitAction (req, res) {
    // return update action
    return this.updateSubmitAction (req, res);
  }

  /**
   * add/edit action
   *
   * @param req
   * @param res
   *
   * @route   {post} /:id/update
   * @layout  admin
   */
  async updateSubmitAction (req, res) {
    // set website variable
    let Code   = new code ();
    let create = true;

    // check for website model
    if (req.params.id) {
      // load by id
      Code   = await code.findById (req.params.id);
      create = false;
    }

    // set details
    Code.set ('rate',     parseFloat (req.body.rate));
    Code.set ('code',     req.body.code);
    Code.set ('state',    req.body.state);
    Code.set ('discount', parseFloat (req.body.discount));

    // save order
    await Code.save ();

    // send alert
    req.alert ('success', 'Successfully ' + (create ? 'Created' : 'Updated') + ' code!');

    // render page
    res.render ('affiliate/admin/update', {
      'code'  : await Code.sanitise (),
      'title' : create ? 'Create Affiliate' : 'Update ' + Code.get ('_id').toString (),
    });
  }

  /**
   * delete action
   *
   * @param req
   * @param res
   *
   * @route   {get} /:id/remove
   * @layout  admin
   */
  async removeAction (req, res) {
    // set website variable
    let Order = false;

    // check for website model
    if (req.params.id) {
      // load user
      Order = await order.findById (req.params.id);
    }

    // render page
    res.render ('order/admin/remove', {
      'title': 'Remove ' + Order.get ('_id').toString (),
      'order' : await Order.sanitise ()
    });
  }

  /**
   * delete action
   *
   * @param req
   * @param res
   *
   * @route   {post} /:id/remove
   * @title   order Administration
   * @layout  admin
   */
  async removeSubmitAction (req, res) {
    // set website variable
    let Order = false;

    // check for website model
    if (req.params.id) {
      // load user
      Order = await order.findById (req.params.id);
    }

    // delete website
    await Order.remove ();

    // alert Removed
    req.alert ('success', 'Successfully removed ' + (Order.get ('_id').toString ()));

    // render index
    return this.indexAction (req, res);
  }

  /**
   * user grid action
   *
   * @param req
   * @param res
   *
   * @route {post} /grid
   */
  gridAction (req, res) {
    // return post grid request
    return this._grid ().post (req, res);
  }

  /**
   * renders grid
   *
   * @return {grid}
   */
  _grid () {
    // create new grid
    let codeGrid = new grid ();

    // set route
    codeGrid.route ('/admin/affiliate/grid');

    // set grid model
    codeGrid.model (code);

    // add grid columns
    codeGrid.column ('_id', {
      'title'  : 'ID',
      'format' : async (col) => {
        return col ? col.toString () : 'N/A';
      }
    }).column ('user', {
      'title'  : 'User',
      'format' : async (col) => {
        return col ? col.get ('username') : 'N/A';
      }
    }).column ('state', {
      'sort'   : true,
      'title'  : 'State',
      'format' : async (col) => {
        // get paid
        return '<span class="btn btn-sm btn-' + (col === 'active' ? 'success' : (col === 'rejected' ? 'danger' : 'info')) + '">' + col + '</span>';
      }
    }).column ('code', {
      'sort'   : true,
      'title'  : 'Code',
      'format' : async (col) => {
        // get paid
        return col || '<i>N/A</i>';
      }
    }).column ('value', {
      'sort'   : true,
      'title'  : 'Value',
      'format' : async (col, row) => {
        return '$' + (await credit.where({
          'code.id' : row.get('_id').toString()
        }).sum('amount')).toFixed(2);
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
    }).column ('actions', {
      'title'  : 'Actions',
      'width'  : '1%',
      'format' : async (col, row) => {
        return [
          '<div class="btn-group btn-group-sm" role="group">',
            '<a href="/admin/affiliate/' + row.get ('_id').toString () + '/update" class="btn btn-primary"><i class="fa fa-pencil"></i></a>',
            '<a href="/admin/affiliate/' + row.get ('_id').toString () + '/remove" class="btn btn-danger"><i class="fa fa-times"></i></a>',
          '</div>'
        ].join ('');
      }
    });

    // set default sort order
    codeGrid.sort ('created_at', 1);

    // return grid
    return codeGrid;
  }
}

/**
 * export affiliate controller
 *
 * @type {adminController}
 */
module.exports = adminController;
