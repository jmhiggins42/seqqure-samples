const express = require('express');
const router = express.Router();

/*
*  Controller imports here
*  Filter/validate middleware imports here
*  Response Model import here
*  JOI Model imports here
*/

module.exports = router;

// NOTE: Normally these are all in their own routing files, but I'm consolidating here for sample purposes

//////////////////////////////
// POST REQUESTS
//////////////////////////////
router.post('/api/emails/send', emailsController.sendEmail);
router.post('/api/users/email', validateBody(Email), usersController.checkEmail);
router.post('/api/invites/send', validateInvitation, invitationsController.sendInvitation);
router.post(
  '/api/users/login',
  validateBody(Login),
  passport.authenticate('local'),
  usersController.loginUser
);

//////////////////////////////
// PUT REQUESTS
//////////////////////////////
router.put(
  '/api/documentTypes/provision/:tenantId([0-9a-fA-F]{24})',
  validateBody(ProvisionRequest),
  docuTypeController.provision
);
router.put(
  '/api/escrowTemplates/provision/:tenantId([0-9a-fA-F]{24})',
  validateBody(ProvisionRequest),
  escrowTemplatesController.provision
);
router.put(
  '/api/invites/resend/:token([0-9a-fA-F]{24})',
  validateToken(false),
  validateInvitation,
  invitationsController.sendInvitation
);

//////////////////////////////
// GET REQUESTS
//////////////////////////////
router.get('/api/signedUrl/mobile/:id', signedUrl.getMobileObjectDocs);
router.get('/api/tenants/:id([0-9a-fA-F]{24})/admins', tenantsController.readAdminsById);
router.get('/api/tenants/:id([0-9a-fA-F]{24})/invites', tenantsController.readInvitesById);
router.get('/api/users/check', validateSession, usersController.confirmLogin);
router.get('/api/users/logout', usersController.logoutUser);
