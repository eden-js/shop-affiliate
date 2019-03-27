<affiliate-admin-update-page>
  <form method="post" action="/admin/affiliate/{ opts.code ? opts.code.id + '/update' : 'create' }" class="appliaction">
    <div class="card">
      <div class="card-header">
        Affiliate Appliaction
      </div>
      <div class="card-body">
        <!-- Rate input -->
        <div class="form-group">
          <label for="state">State</label>
          <select name="state" class="form-control">
            <option value="pending" selected={ opts.code.state === 'pending' }>Pending</option>
            <option value="active" selected={ opts.code.state === 'active' }>Active</option>
            <option value="rejected" selected={ opts.code.state === 'rejected' }>Rejected</option>
          </select>
        </div>

        <!-- Code input -->
        <div class="form-group">
          <label for="code">Code</label>
          <input id="code" name="code" type="text" placeholder="Code" class="form-control" value={ opts.code.code } required />
        </div>

        <!-- Rate input -->
        <div class="form-group">
          <label for="rate">Affiliate Rate</label>
          <div class="input-group">
            <input type="number" name="rate" value={ opts.code.rate } class="form-control" />
            <div class="input-group-append">
              <span class="input-group-text">%</span>
            </div>
          </div>
        </div>

        <!-- Rate input -->
        <div class="form-group">
          <label for="rate">Discount Rate</label>
          <div class="input-group">
            <input type="number" name="discount" value={ opts.code.discount } class="form-control" />
            <div class="input-group-append">
              <span class="input-group-text">%</span>
            </div>
          </div>
        </div>

        <!-- First Name input -->
        <div class="form-group">
          <label for="first">First Name</label>
          <input id="first" name="first" type="text" placeholder="First Name" class="form-control" value={ opts.code.user.first } />
        </div>

        <!-- Last Name input -->
        <div class="form-group">
          <label for="last">Last Name</label>
          <input id="last" name="last" type="text" placeholder="Last Name" class="form-control" value={ opts.code.user.last } />
        </div>

        <!-- Email input -->
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" name="email" type="text" placeholder="Email" class="form-control" value={ opts.code.user.email } />
        </div>

        <!-- Promotion input  -->
        <div class="form-group">
          <label for="notes">How do you intend to promote our product(s)?</label>
          <textarea class="form-control" id="notes" name="notes" rows="6">{ opts.code.notes }</textarea>
        </div>

      </div>
      <div class="card-footer">
        <button type="submit" class="btn btn-primary">
          Submit
        </button>
      </div>
    </div>
  </form>

  <script>

  </script>
</affiliate-admin-update-page>
