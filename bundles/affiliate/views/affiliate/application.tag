<affiliate-application-page>
  <form method="post" action="/affiliate/application" class="my-5 appliaction">
    <div class="card">
      <div class="card-header">
        Affiliate Appliaction
      </div>
      <div class="card-body">
        <!-- Code input -->
        <div class="form-group">
          <label for="code">Code</label>
          <input id="code" name="code" type="text" placeholder="Code" class="form-control" required />
          <small>This is the code people insert at the checkout, alternatively used in links to our site.</small>
        </div>

        <!-- Rate input -->
        <div class="form-group">
          <label for="rate">Affiliate Rate</label>
          <select name="rate" class="form-control">
            <option value="0">0%</option>
            <option value="1">1%</option>
            <option value="2">2%</option>
            <option value="3">3%</option>
            <option value="4">4%</option>
            <option value="5">5%</option>
          </select>
          <small>The rate at which you want to be rewarded for referral purchases.</small>
        </div>

        <!-- Rate input -->
        <div class="form-group">
          <label for="rate">Discount Rate</label>
          <select name="discount" class="form-control">
            <option value="0">0%</option>
            <option value="1">1%</option>
            <option value="2">2%</option>
            <option value="3">3%</option>
            <option value="4">4%</option>
            <option value="5">5%</option>
            <option value="custom">Custom (Tell us in your notes)</option>
          </select>
          <small>The rate at which your code will provide a discount, please not we manually approve all appliactions and discounts are usually only for sale periods.</small>
        </div>

        <!-- First Name input -->
        <div class="form-group">
          <label for="first">First Name</label>
          <input id="first" name="first" type="text" placeholder="First Name" class="form-control" required />
        </div>

        <!-- Last Name input -->
        <div class="form-group">
          <label for="last">Last Name</label>
          <input id="last" name="last" type="text" placeholder="Last Name" class="form-control" required />
        </div>

        <!-- Email input -->
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" name="email" value={ this.user.email } type="text" placeholder="Email" class="form-control" required />
        </div>

        <!-- Promotion input  -->
        <div class="form-group">
          <label for="notes">How do you intend to promote our product(s)?</label>
          <textarea class="form-control" id="notes" name="notes" rows="6"></textarea>
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
    // do mixins
    this.mixin ('user');

  </script>
</affiliate-application-page>
