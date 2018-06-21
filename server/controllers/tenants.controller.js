// Services / Utilities
const responses = require('../models/responses');
const tenantsService = require('../services/tenants.service');

const readInvitesById = (req, res) => {
  tenantsService
    .readInvitesById(req.params.id)
    .then(invites => {
      res.json(new responses.ItemsResponse(invites));
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(new responses.ErrorResponse(err));
    });
};

const readAdminsById = (req, res) => {
  tenantsService
    .readAdminsById(req.params.id)
    .then(admins => {
      res.json(new responses.ItemsResponse(admins));
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(new responses.ErrorResponse(err));
    });
};

module.exports = {
  readInvitesById,
  readAdminsById
};
