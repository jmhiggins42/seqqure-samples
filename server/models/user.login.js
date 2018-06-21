const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const schema = {
  email: Joi.string()
    .email({ minDomainAtoms: 2 })
    .required(),
  tenantId: Joi.objectId().required(),
  password: Joi.string().required()
};

module.exports = Joi.object().keys(schema);
