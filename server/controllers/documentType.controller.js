// Services / Utilities
const documentTypeService = require('../services/documentType.service');
const responses = require('../models/responses');

const getAllMaster = (req, res) => {
  documentTypeService
    .getAllMaster()
    .then(docu => {
      const responseModel = new responses.ItemsResponse();
      responseModel.items = docu;
      res.json(responseModel);
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
  documentTypeService
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
  getAllMaster,
  provision
};
