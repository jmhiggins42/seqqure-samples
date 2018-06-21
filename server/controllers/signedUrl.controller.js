// Services / Utilities
const responses = require('../models/responses');
const signedUrlService = require('../services/signedUrl.services');

// getObjectDocs() returned a blob for the front-end to handle
// for mobile, wanted to return the S3 Signed URL (data) for the phone to open through native code

getMobileObjectDocs = (req, res) => {
  const filename = req.params.id;
  signedUrlService.getMobileObjectDocs(filename, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(new responses.ErrorResponse(err));
    } else {
      res.status(200).send(new responses.ItemResponse(data));
    }
  });
};

module.exports = { getMobileObjectDocs };
