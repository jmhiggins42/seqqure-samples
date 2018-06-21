// Services / Utilities
const usersService = require('../services/users.service');
const responses = require('../models/responses');

const checkEmail = (req, res) => {
  usersService
    .getTenantsByEmail(req.model.email)
    .then(tenants => {
      if (tenants.length > 0) {
        return res.json(new responses.ItemsResponse(tenants));
      } else {
        return res.status(400).send(new responses.ErrorResponse('No record of email found'));
      }
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send(new responses.ErrorResponse(err));
    });
};

const loginUser = (req, res) => {
  const now = new Date();
  usersService
    .onLogin(req.user._id, now)
    .then(() => res.status(200).json(new responses.SuccessResponse()))
    .catch(err => {
      console.log(err);
      return res.status(500).send(new responses.ErrorResponse(err));
    });
};

// if request reaches this point, the login session has been confirmed
const confirmLogin = (req, res) => {
  res.status(200).json(new responses.SuccessResponse());
};

const logoutUser = (req, res) => {
  req.logout();
  res.status(200).json(new responses.SuccessResponse());
};

module.exports = {
  checkEmail,
  loginUser,
  confirmLogin,
  logoutUser
};
