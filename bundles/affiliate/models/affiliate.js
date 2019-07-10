
// require local dependencies
const Model  = require('model');
const config = require('config');

// get form helper
const formHelper = helper('form');

/**
 * create affiliate model
 */
class Affiliate extends Model {
  /**
   * construct affiliate model
   */
  constructor(...args) {
    // run super
    super(...args);

    // bind methods
    this.sanitise = this.sanitise.bind(this);
  }

  /**
   * sanitises affiliate model
   *
   * @return {*}
   */
  async sanitise() {
    // return object
    const sanitised = {
      id         : this.get('_id') ? this.get('_id').toString() : null,
      rates      : this.get('rates'),
      created_at : this.get('created_at'),
      updated_at : this.get('updated_at'),
    };

    // get form
    const form = await formHelper.get('edenjs.shop.affiliate');

    // add other fields
    await Promise.all((form.get('_id') ? form.get('fields') : config.get('shop.affiliate.fields').slice(0)).map(async (field) => {
      // set field name
      const fieldName = field.name || field.uuid;

      // set sanitised
      sanitised[fieldName] = await this.get(fieldName);
      // eslint-disable-next-line max-len
      sanitised[fieldName] = sanitised[fieldName] && sanitised[fieldName].sanitise ? await sanitised[fieldName].sanitise() : sanitised[fieldName];
      // eslint-disable-next-line max-len
      sanitised[fieldName] = Array.isArray(sanitised[fieldName]) ? await Promise.all(sanitised[fieldName].map((val) => {
        // return sanitised value
        if (val.sanitise) return val.sanitise();

        // return value
        return val;
      })) : sanitised[fieldName];
    }));

    // await hook
    await this.eden.hook('affiliate.sanitise', {
      sanitised,
      affiliate : this,
    });

    // return sanitised
    return sanitised;
  }
}

/**
 * export Affiliate model
 *
 * @type {Affiliate}
 */
module.exports = Affiliate;
