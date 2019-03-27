<affiliate-checkout>
  <div class="card card-shipping card-checkout mb-3">
    <div class="card-header">
      { this.t ('affiliate.title') }
    </div>
    <div class="card-body">
      <div class="row row-eq-height" if={ opts.action.value && opts.action.value.code }>
        <div class="col-6 d-flex align-items-center">
          <b class="m-0 w-100">
            Code: "{ opts.action.value.code }"
          </b>
        </div>
        <div class="col-3 text-right d-flex align-items-center">
          <div class="w-100">
            { opts.action.value.discount }% off
          </div>
        </div>
        <div class="col-3">
          <button type="button" class="btn btn-block btn-danger" onclick={ onRemove }>
            Remove
          </button>
        </div>
      </div>
      <div class="row" if={ !opts.action.value || !opts.action.value.code }>
        <div class="col-8">
          <div class="form-group m-0">
            <input type="text" class="form-control" ref="code" onchange={ onCode } />
          </div>
        </div>
        <div class="col-4">
          <button type="button" class={ 'btn btn-block btn-primary' : true, 'disabled' : this.loading } disabled={ this.loading }>
            { this.loading ? 'Loading' : 'Validate' }
          </button>
        </div>
      </div>
    </div>
  </div>

  <script>
    // do mixins
    this.mixin ('i18n');
    this.mixin ('user');

    // set variables
    this.loading = false;

    /**
     * on address function
     *
     * @param  {Event}  e
     */
    async onCode (e) {
      // set loading
      this.loading = true;

      // update
      this.update ();

      // validate code
      let validate = await socket.call ('checkout.code', this.refs.code.value);

      // set validate to value
      opts.action.value = validate;

      // update
      opts.checkout.update ();

      // set loading
      this.loading = false;

      // update
      this.update ();
    }

    /**
     * on remove removes code
     */
    onRemove () {
      // set validate to value
      opts.action.value = {};

      // update
      opts.checkout.update ();
    }

    /**
     * on remove removes code
     */
    this.on ('mount', () => {
      // set validate to value
      if (!opts.action.value) opts.action.value = {};
    });

  </script>
</affiliate-checkout>
