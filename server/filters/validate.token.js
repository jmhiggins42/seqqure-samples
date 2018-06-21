// Services / Utilities
const invitationsService = require('../services/invitations.service');
const responses = require('../models/responses');

const validate = confirmStatus => (req, res, next) => {
  if (req.params.token) {
    invitationsService
      .getById(req.params.token)
      .then(invitation => {
        if (confirmStatus) {
          const now = new Date().getTime();
          const then = invitation._id.getTimestamp().getTime();
          const secsExpired = (now - then) / 1000;
          const expiration = parseInt(process.env.INVITATION_EXPIRATION, 10);

          if (secsExpired > expiration) {
            res.status(403).send(new responses.ErrorResponse('invitation expired'));
            return;
          } else if (invitation.registeredDate) {
            res
              .status(403)
              .send(
                new responses.ErrorResponse('user has already registered with this invitation code')
              );
            return;
          }
        }

        const mode = confirmStatus ? 'model' : 'body';
        req[mode] = {
          personId: invitation.personId.toString(),
          tenantId: invitation.tenantId.toString(),
          escrowId: invitation.escrowId ? invitation.escrowId.toString() : null,
          roleId: invitation.roleId.toString()
        };
        next();
      })
      .catch(() => {
        res.status(403).send(new responses.ErrorResponse('invalid invitation'));
        return;
      });
  } else {
    res.status(403).send(new responses.ErrorResponse('No token provided'));
    return;
  }
};

module.exports = validate;
