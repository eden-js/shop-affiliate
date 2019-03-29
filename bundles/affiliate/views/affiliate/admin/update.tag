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
          
          
          <div class="card mb-4">
            <div class="card-body">
              <form-render action="/admin/affiliate/{ opts.item && opts.item.id ? opts.item.id + '/update' : 'create' }" method="post" ref="form" form={ opts.form } placement="edenjs.shop.affiliate" positions={ this.positions } preview={ this.preview } class="d-block mb-3" />
            </div>
            <div class="card-footer text-right">
              <button type="button" onclick={ onSubmit } class={ 'btn btn-success' : true, 'disabled' : this.loading } disabled={ this.loading }>
                { this.loading ? 'Submitting...' : 'Submit' }
              </button>
            </div>
          </div>
      
          <div class="card" if={ this.user }>
            <div class="card-header">
              Affiliate Credits
            </div>
            <div class="card-body">
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
