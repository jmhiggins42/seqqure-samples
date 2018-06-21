const responses = require('../models/responses');
const constants = require('../constants');

// Middleware to validate that request is from a Master Administrator

const validate = (req, res, next) => {
  const { roles } = req.session.passport.user;
  if (!roles.includes(constants.ROLE_MA)) {
    res.status(403).send(new responses.ErrorResponse('Must be a Master Admin to access'));
    return;
  }

  next();
};

module.exports = validate;
