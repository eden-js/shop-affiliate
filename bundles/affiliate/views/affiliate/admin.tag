<affiliate-admin-page>
  <div class="page page-fundraiser">

    <admin-header title="Manage Affiliates">
      <yield to="right">
        <a href="/admin/affiliate/create" class="btn btn-lg btn-success">
          <i class="fa fa-plus ml-2"></i> Create Affiliate
        </a>
      </yield>
    </admin-header>
    
    <div class="container-fluid">
    
      <grid ref="grid" grid={ opts.grid } table-class="table table-striped table-bordered" title="Affiliate Grid" />
    
    </div>
  </div>
</affiliate-admin-page>
