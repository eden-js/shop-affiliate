<affiliate-summary-extra>
  <div class="discount-total mt-3" if={ opts.action.value && opts.action.value.amount }>
    <div class="row">
      <div class="col-9 text-right">
        <p class="lead mb-0">
          Discount
        </p>
      </div>
      <div class="col-3 text-right">
        <p class="lead mb-0">
          <money amount={ opts.action.value.amount } />
        </p>
      </div>
    </div>
  </div>
</affiliate-summary-extra>
