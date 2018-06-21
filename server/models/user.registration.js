const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const schema = {
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  loginEmail: Joi.string()
    .email({ minDomainAtoms: 2 })
    .required(),
  password: Joi.string()
    .regex(/^(?=.*[0-9]).{6,}$/)
    .required(),
  invitationId: Joi.objectId().required(),
  roleId: Joi.objectId().required(),
  personId: Joi.objectId().required(),
  tenantId: Joi.objectId(),
  escrowId: Joi.objectId().allow('')
};

module.exports = Joi.object().keys(schema);
