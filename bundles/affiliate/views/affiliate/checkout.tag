<affiliate-checkout>
  <div class="card card-shipping card-checkout mb-3">
    <div class="card-header">
      { this.t('affiliate.title') }
    </div>
    <div class="card-body" if={ opts.action.value && getUser(opts.action.value) }>
      <label for="affiliate">
        Supporting User
      </label>
      <div class="input-group">
        <input class="form-control" type="text" readonly value={ getUser(opts.action.value).username } />
        <div class="input-group-append">
          <button class="btn btn-danger" onclick={ onRemove }>
            <i class="fa fa-times" />
          </button>
        </div>
      </div>
    </div>
    <div class="card-body" if={ !opts.action.value || !getUser(opts.action.value) }>
      <label for="affiliate">
        Support User
      </label>
      <div class="input-group">
        <eden-select ref="select" class="form-control p-0" url="/admin/user/query" name="user" label={ 'Search by Name' } data={ { 'value' : null } } on-change={ onSelectUser }>
          <option each={ user, i in opts.data.value || [] } selected="true" value={ user.id }>
            { user.text }
          </option>
        </eden-select>
        <div class="input-group-append" if={ this.loading() }>
          <div class="input-group-text">
            <i class="fa fa-spinner fa-spin" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // do mixins
    this.mixin('i18n');
    this.mixin('user');
    this.mixin('loading');
    
    /**
     * on remove
     *
     * @param  {Event} e
     *
     * @return {*}
     */
    onRemove(e) {
      // prevent default
      e.preventDefault();
      e.stopPropagation();

      // set value
      opts.action.value = {};
      
      // update parent
      eden.checkout.update();
        
      // update
      this.update();
    }
    
    /**
     * on select user
     *
     * @param  {Event} e
     *
     * @return {*}
     */
    async onSelectUser(e) {
      // return
      if (!e.target.value) return;
      
      // get affiliate
      this.loading('affiliate', true);
      
      // set res
      const res = await fetch(`/affiliate/${e.target.value}/get`);
      
      // get json
      opts.action.value = (await res.json()).result;
      
      // update parent
      eden.checkout.update();
      
      // get affiliate
      this.loading('affiliate', false);
    }
    
    /**
     * gets user from value
     *
     * @param  {*} value
     * @return {*}
     */
    getUser(value) {
      // gets value
      return value && Array.isArray(value.user) ? value.user[0] : value.user;
    }

    /**
     * on remove removes code
     */
    this.on('mount', () => {
      // set validate to value
      if (!opts.action.value) opts.action.value = {};
    });

  </script>
</affiliate-checkout>
