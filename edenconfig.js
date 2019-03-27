// create config object
const config = {};

// set config.sales
if (!config.shop) config.shop = {};

// default account config
config.shop.affiliate = {
  fields : [
    {
      name  : 'name',
      grid  : true,
      type  : 'text',
      label : 'Name',
    },
    {
      name  : 'user',
      grid  : true,
      type  : 'admin.user',
      label : 'User',
    },
    {
      name  : 'email',
      grid  : true,
      type  : 'email',
      label : 'Email',
    },
    {
      name  : 'description',
      type  : 'textarea',
      label : 'Description',
    },
  ],
};

// export config
module.exports = config;
