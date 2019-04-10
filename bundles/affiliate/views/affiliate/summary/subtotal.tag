<affiliate-summary-subtotal>
  <div class="discount-total text-success" if={ opts.action && opts.action.value.id && opts.action.value.discount || 0 }>
    <p class="mb-2">
      Supporter Discount
      <money class="float-right" amount={ opts.action.value.discount || 0 } />
    </p>
  </div>
</affiliate-summary-subtotal>
