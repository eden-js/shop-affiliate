<affiliate-page>
  <div class="my-5 affiliate-page">
    <div class="row mb-4">

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
              Total Paid / Total Discount
            </p>
            <h3 class="text-uppercase text-primary">
              ${ (opts.orders || 0).toLocaleString() } / ${ (opts.discount || 0).toLocaleString() }
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
              ${ this.balance.balance.toLocaleString() }
            </h3>
          </div>
        </div>
      </div>
      <!-- / referrals all time -->

    </div>

    <div class="row">

      <div class="col-6" each={ code, i in opts.codes }>
        <div class="card card-body">
          <div class="row row-eq-height">
            <div class="col-6">
              <h2 class="m-0">
                <a href="#!">
                  { code.code }
                </a>
              </h2>
            </div>
            <div class="col-6 text-right d-flex align-items-center">
              <div class="w-100">
                Rate { code.rate }%, Discount { code.discount }%
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="mb-4 mt-4">
      <a href="/affiliate/apply" class="btn btn-lg btn-success">
        Apply for new code
      </a>
    </div>

    <div class="grid-area">
      <grid grid={ opts.grid } table-class="table table-striped table-bordered" title="Affiliate Credits" />
    </div>

  </div>

  <script>
    // do mixins
    this.mixin('user');
    this.mixin('balance');

    // set loading
    this.loading = {};

    /**
     * on code
     *
     * @param  {Event} e
     */
    onCode (e) {
      // set loading
      this.isLoading ('code', true);

      // return true
      return true;
    }

    /**
     * on code
     *
     * @param  {Event} e
     */
    onApply (e) {
      // set loading
      this.isLoading ('rate', true);

      // return true
      return true;
    }

    /**
     * is loading
     *
     * @param  {String}   type
     * @param  {Boolean}  way
     */
    isLoading (type, way) {
      // set loading
      this.loading[type] = way;

      // update view
      this.update ();
    }

    /**
     * on mount function
     */
    this.on ('mount', () => {
      // check frontend
      if (!this.eden.frontend) return;

      // set loading
      this.loading = {};

      // update
      this.update ();
    });

  </script>
</affiliate-page>
