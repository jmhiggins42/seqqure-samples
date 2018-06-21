const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const schema = {
  selectedIds: Joi.array().items(Joi.objectId().required()),
  tenantId: Joi.object(),
  createdById: Joi.object(),
  modifiedById: Joi.object(),
  modifiedDate: Joi.date()
};

module.exports = Joi.object().keys(schema);
