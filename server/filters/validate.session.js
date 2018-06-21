// Utilities
const responses = require('../models/responses');
const ObjectId = require('mongodb').ObjectId;

// middleware to validate that the request is coming from a logged in user

const validate = (req, res, next) => {
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    res.status(403).send(new responses.ErrorResponse('Not logged in'));
    return;
  }

  const user = req.session.passport.user;

  if (req.body.escrowInfo) {
    req.body.escrowInfo.tenantId = ObjectId(user.tenantId);
  } else {
    req.body.tenantId = ObjectId(req.body.tenantId || user.tenantId);
  }

  // session OK
  next();
};

module.exports = validate;
