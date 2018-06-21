// Services / Utilities
const escrowTemplatesService = require('../services/escrowTemplates.service');
const responses = require('../models/responses');

const readAllMaster = (req, res) => {
  escrowTemplatesService
    .readAllMaster()
    .then(eTemps => {
      res.json(new responses.ItemsResponse(eTemps));
    })
    .catch(err => {
      console.log(err);
      if (typeof err === 'object' && Object.keys(err).length === 0) {
        err = 'Mongo Error';
      }
      res.status(500).send(new responses.ErrorResponse(err));
    });
};

const provision = (req, res) => {
  escrowTemplatesService
    .provision(req.params.tenantId, req.model.selectedIds, req.session.passport.user._id)
    .then(result => {
      res.status(201).json(new responses.ItemResponse(result));
    })
    .catch(err => {
      console.log(err);
      if (typeof err === 'object' && Object.keys(err).length === 0) {
        err = 'Mongo Error';
      }
      res.status(500).json(new responses.ErrorResponse(err));
    });
};

module.exports = {
  readAllMaster,
  provision
};
