<element-affiliate>
  <span each={ item, i in this.affiliates }>
    <a href="/admin/affiliate/{ item.id }/update">{ item.name }</a>
    { i === this.affiliates.length - 1 ? '' : ', ' }
  </span>
  
  <script>
    // set affiliates
    this.affiliates = (Array.isArray(opts.data.value) ? opts.data.value : [opts.data.value]).filter(v => v);
    
  </script>
</element-affiliate>
