// Services / Utilities
const emailsService = require('../services/emails.service');
const responses = require('../models/responses');

// *NOTE TO OTHER USERS*
// Response body should contain the following:
//    to      - recipient's email address
//    from    - sender's email address
//    subject - Subject Line text
//    text    - text of the email to send
//    html    - html version of the email to send

const sendEmail = (req, res) => {
  console.log(req.body);

  emailsService
    .sendEmail(req.body)
    .then(() => {
      res.status(200).json(new responses.SuccessResponse());
    })
    .catch(err => {
      console.log(err);
      if (typeof err === 'object' && Object.keys(err).length === 0) {
        err = 'Mongo Error';
      }
      res.status(500).send(new responses.ErrorResponse(err));
    });
};

module.exports = { sendEmail };
