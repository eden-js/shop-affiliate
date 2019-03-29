<affiliate-admin-update-page>
  <div class="page page-admin">

    <admin-header title="{ opts.item && opts.item.id ? 'Update' : 'Create ' } Affiliate" preview={ this.preview } on-preview={ onPreview }>
      <yield to="right">
        <a href="/admin/affiliate" class="btn btn-lg btn-primary mr-2">
          Back
        </a>
        <button class={ 'btn btn-lg' : true, 'btn-primary' : opts.preview, 'btn-success' : !opts.preview } onclick={ opts.onPreview }>
          { opts.preview ? 'Alter Form' : 'Finish Altering' }
        </button>
      </yield>
    </admin-header>

    <div class="container-fluid">
      <div class="row row-eq-height">
      
        <div class="col-xl-3 col-lg-4" if={ this.user }>
          <div class="card">
            <div class="card-body">
              <div class="text-center">
                <media-img if={ this.user.avatar } image={ Array.isArray(this.user.avatar) ? this.user.avatar[0] : this.user.avatar } label="1x-sq" classes="w-50 img-fluid rounded-circle img-avatar mb-4" />
                <h2>
                  { this.user.username || this.user.email }
                </h2>
                <p class="text-muted m-0">
                  { opts.item.name } | Member for: { getDate(this.user.created_at) }
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col">
          <div class="row mb-4" if={ this.user }>

            <!-- earnings this month -->
            <div class="col-3">
              <div class="card card-stat text-center">
                <div class="card-body">
                  <h3 class="text-uppercase">
                    Earnings
                  </h3>
                  <p class="text-uppercase">
                    This Month
                  </p>
                  <h3 class="text-uppercase text-primary">
                    <money amount={ ((opts.credits || {}).all || 0) } /> / { opts.totals.month.toLocaleString() }
                  </h3>
                </div>
              </div>
            </div>
            <!-- / earnings this month -->

            <!-- earnings all time -->
            <div class="col-3">
              <div class="card card-stat text-center">
                <div class="card-body">
                  <h3 class="text-uppercase">
                    Earnings
                  </h3>
                  <p class="text-uppercase">
                    All Time
                  </p>
                  <h3 class="text-uppercase text-primary">
                    <money amount={ ((opts.credits || {}).all || 0) } /> / { opts.totals.all.toLocaleString() }
                  </h3>
                </div>
              </div>
            </div>
            <!-- / earnings all time -->

            <!-- referrals this month -->
            <div class="col-3">
              <div class="card card-stat text-center">
                <div class="card-body">
                  <h3 class="text-uppercase">
                    Total
                  </h3>
                  <p class="text-uppercase">
                    Total Paid
                  </p>
                  <h3 class="text-uppercase text-primary">
                    ${ (opts.orders || 0).toLocaleString() }
                  </h3>
                </div>
              </div>
            </div>
            <!-- / referrals this month -->

            <!-- referrals all time -->
            <div class="col-3">
              <div class="card card-stat text-center">
                <div class="card-body">
                  <h3 class="text-uppercase">
                    Balance
                  </h3>
                  <p class="text-uppercase">
                    withdrawable
                  </p>
                  <h3 class="text-uppercase text-primary">
                    ${ ((this.user || {}).balance || 0).toLocaleString() }
                  </h3>
                </div>
              </div>
            </div>
            <!-- / referrals all time -->

          </div>
          
          
          <div class="card">
            <div class="card-header">
              <ul class="nav nav-tabs card-header-tabs">
                <li class="nav-item">
                  <a class={ 'nav-link' : true, 'active' : this.tab === 'details' } href="#" onclick={ onDetails }>
                    Details
                  </a>
                </li>
                <li class="nav-item">
                  <a class={ 'nav-link' : true, 'active' : this.tab === 'rates', 'disabled' : !opts.item.id } href="#" disabled={ !opts.item.id } onclick={ opts.item.id ? onRates : null }>
                    Rates
                  </a>
                </li>
                <li class="nav-item">
                  <a class={ 'nav-link' : true, 'active' : this.tab === 'credits', 'disabled' : !opts.item.id } href="#" disabled={ !opts.item.id } onclick={ opts.item.id ? onCredits : null }>
                    Credits
                  </a>
                </li>
              </ul>
            </div>
            
            <div class="card-body" show={ this.tab === 'details' }>
              <form-render action="/admin/affiliate/{ opts.item && opts.item.id ? opts.item.id + '/update' : 'create' }" method="post" ref="form" form={ opts.form } placement="edenjs.shop.affiliate" positions={ this.positions } preview={ this.preview } class="d-block mb-3" />
            </div>
            <div class="card-footer text-right" if={ this.tab === 'details' }>
              <button type="button" onclick={ onSubmit } class={ 'btn btn-success' : true, 'disabled' : this.loading } disabled={ this.loading }>
                { this.loading ? 'Submitting...' : 'Submit' }
              </button>
            </div>
            
            <form if={ this.tab === 'rates' } method="post" action="/admin/affiliate/{ opts.item.id }/update">
              <div class="card-body">
                <div each={ type, i in opts.types } class="form-group">
                  <label for={ type.type }>
                    { type.type }
                  </label>
                  <div class="input-group">
                    <input class="form-control" type="number" value={ (opts.item.rates || {})[type.type] } name="rates[{ type.type }]" />
                    <div class="input-group-append">
                      <span class="input-group-text">%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-footer text-right">
                <button type="submit" onclick={ onSubmitRates } class={ 'btn btn-success' : true, 'disabled' : this.loading } disabled={ this.loading }>
                  { this.loading ? 'Submitting...' : 'Submit' }
                </button>
              </div>
            </form>
            
            <div class="card-body" if={ this.tab === 'credits' }>
              <grid grid={ opts.grid } table-class="table table-striped table-bordered" title="Affiliate Credits" />
            </div>
            
          </div>
        </div>
      </div>
    </div>
    
  </div>

  <script>
    // do mixin
    this.mixin('i18n');

    // set type
    this.tab     = 'details';
    this.type    = opts.item.type || 'raised';
    this.user    = (Array.isArray(opts.item.user) ? opts.item.user[0] : opts.item.user);
    this.preview = true;
    
    // require uuid
    const uuid = require('uuid');
    
    // set placements
    this.positions = opts.positions || opts.fields.map((field) => {
      // return field
      return {
        'type'     : field.type,
        'uuid'     : uuid(),
        'name'     : field.name,
        'i18n'     : !!field.i18n,
        'label'    : field.label,
        'force'    : true,
        'multiple' : field.multiple,
        'children' : []
      };
    });
    
    /**
     * on submit
     *
     * @param  {Event} e
     *
     * @return {*}
     */
    async onSubmit (e) {
      // prevent default
      e.preventDefault();
      e.stopPropagation();
      
      // set loading
      this.loading = true;
      
      // update view
      this.update();
      
      // submit form
      await this.refs.form.submit();
      
      // set loading
      this.loading = false;
      
      // update view
      this.update();
    }
    
    /**
     * on preview
     *
     * @param  {Event} e
     *
     * @return {*}
     */
    onPreview (e) {
      // prevent default
      e.preventDefault();
      e.stopPropagation();
      
      // set loading
      this.preview = !this.preview;
      
      // update view
      this.update();
    }

    /**
     * on details tab
     *
     * @param  {Event} e
     */
    onDetails(e) {
      // prevent default
      e.preventDefault();
      e.stopPropagation();

      // set tab
      this.tab = 'details';
      this.update();
    }

    /**
     * on rates tab
     *
     * @param  {Event} e
     */
    onRates(e) {
      // prevent default
      e.preventDefault();
      e.stopPropagation();

      // set tab
      this.tab = 'rates';
      this.update();
    }

    /**
     * on credits tab
     *
     * @param  {Event} e
     */
    onCredits(e) {
      // prevent default
      e.preventDefault();
      e.stopPropagation();

      // set tab
      this.tab = 'credits';
      this.update();
    }

    /**
     * get category
     *
     * @return {Object}
     */
    affiliate () {
      // return category
      return opts.item;
    }
    
    /**
     * gets date
     *
     * @param  {Date} date
     *
     * @return {String}
     */
    getDate(date) {
      // moment
      const moment = require('moment');
      
      // from now
      return moment(date).fromNow(true);
    }

    /**
     * on language update function
     */
    this.on('update', () => {

    });

  </script>
</affiliate-admin-update-page>
