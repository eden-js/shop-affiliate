<affiliate-page>
  <div class="container container-affiliate py-5">
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
              ${ this.balance.balance.toLocaleString() }
            </h3>
          </div>
        </div>
      </div>
      <!-- / referrals all time -->

    </div>

    <div class="row">

      <div class="col-4" each={ code, i in opts.codes }>
        <div class="card card-body">
          <h2 class="m-0">
            { code.code }
          </h2>
        </div>
      </div>

    </div>

    <div class="grid-area">
      <grid grid={ opts.grid } table-class="table table-striped table-bordered" title="Affiliate Credits" />
    </div>

  </div>

  <script>
    // do mixins
    this.mixin('user');
    this.mixin('balance');

    /**
     * on mount function
     */
    this.on('mount', () => {
      // check frontend
      if (!this.eden.frontend) return;

      // update
      this.update();
    });

  </script>
</affiliate-page>
