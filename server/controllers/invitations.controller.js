const path = require('path');
require('dotenv').config();

// Services
const emailsService = require('../services/emails.service');
const escrowsService = require('../services/escrow.service');
const escrowPeopleService = require('../services/escrow.people.service');
const invitationsService = require('../services/invitations.service');
const peopleService = require('../services/people.service');
const securityService = require('../services/security.service');
const tenantsService = require('../services/tenants.service');
const usersService = require('../services/users.service');

// Utilities
const responses = require('../models/responses');
const writeEmail = require('../helpers/email.parser'); // CLI implementation found @ https://github.com/jmhiggins42/email-parser
const utilityFuncs = require('../helpers/utilities.js');

const apiPrefix = 'api/invites';

const sendInvitation = (req, res) => {
  const invitation = {
    recipient: req.model.publicEmail,
    roleId: req.model.roleId,
    personId: req.model._id,
    tenantId: req.model.tenantId,
    escrowId: req.model.escrowId || null
  };

  // post invitation to MongoDB collection
  invitationsService
    .post(invitation)
    .then(id => {
      // Send out email invite via SendGrid APi
      const name = {
        fName: req.model.firstName,
        lName: req.model.lastName,
        mName: req.model.middleName,
        pName: req.model.prefixName,
        sName: req.model.suffixName
      };

      const emailMap = {
        fullName: utilityFuncs.printName(name),
        tenantName: utilityFuncs.trimTrailingPeriod(req.model.tenantName),
        role: req.model.role,
        tenantEmployeeName: req.session.passport.user.name || req.session.passport.user.email,
        transactionType: req.model.transactionType || null,
        escrowNumber: req.model.escrowNumber || null,
        propertyAddress: req.model.propertyAddress || null,
        tenantDomain: process.env.TENANT_DOMAIN,
        inviteToken: id
      };

      const filePath =
        path.join(__dirname, '../emails') +
        (req.model.escrowId ? '/invitation.full.html' : '/invitation.short.html');

      writeEmail(filePath, emailMap, (text, html) => {
        const invite = {
          to: req.model.publicEmail,
          from: process.env.SUPERADMIN_EMAIL,
          subject: `Welcome to SeQQure!`,
          text: text,
          html: html
        };

        emailsService
          .sendEmail(invite)
          .then(() => {
            res
              .status(201)
              .location(`${apiPrefix}/${id}`)
              .json(new responses.ItemResponse(id));
          })
          .catch(err => {
            // Per SendGrid API: Extract error msg
            const { message, code } = err;
            console.log(err.toString());
            res.status(code).send(new responses.ErrorResponse(message));
          });
      });
    })
    .catch(err => {
      console.log(err);
      if (typeof err === 'object' && Object.keys(err).length === 0) {
        err = 'Mongo Error';
      }
      res.status(500).send(new responses.ErrorResponse(err));
    });
};

// Returns information from multiple collections to client to pre-load registration form
const confirmInvitation = (req, res) => {
  const responseModel = {
    personId: req.model.personId,
    tenantId: req.model.tenantId,
    escrowId: req.model.escrowId,
    roleId: req.model.roleId
  };

  const getPersonInfo = peopleService.getPersonById(req.model.personId).catch(err => {
    console.log(err);
    if (typeof err === 'object' && Object.keys(err).length === 0) {
      err = 'Mongo Error';
    }
    res.status(500).send(new responses.ErrorResponse(err));
  });

  const getTenantInfo = tenantsService.readById(req.model.tenantId).catch(err => {
    console.log(err);
    if (typeof err === 'object' && Object.keys(err).length === 0) {
      err = 'Mongo Error';
    }
    res.status(500).send(new responses.ErrorResponse(err));
  });

  const getSecurityInfo = securityService.readById(req.model.roleId).catch(err => {
    console.log(err);
    if (typeof err === 'object' && Object.keys(err).length === 0) {
      err = 'Mongo Error';
    }
    res.status(500).send(new responses.ErrorResponse(err));
  });

  const getEscrowInfo = !req.model.escrowId
    ? Promise.resolve(null)
    : escrowsService.readById(req.model.escrowId).catch(err => {
        console.log(err);
        if (typeof err === 'object' && Object.keys(err).length === 0) {
          err = 'Mongo Error';
        }
        res.status(500).send(new responses.ErrorResponse(err));
      });

  Promise.all([getPersonInfo, getTenantInfo, getSecurityInfo, getEscrowInfo])
    .then(([person, tenant, role, escrow]) => {
      // add all the collected info to the response model
      responseModel.firstName = person.firstName;
      responseModel.lastName = person.lastName;
      responseModel.email = person.publicEmail;
      responseModel.tenantName = tenant.tenantName;
      responseModel.role = role.name;
      if (escrow) {
        responseModel.escrowNumber = escrow.escrowNumber;
        responseModel.street = escrow.street;
        responseModel.transactionType = escrow.transactionType;
      }
      res.json(new responses.ItemResponse(responseModel));
    })
    .catch(err => {
      console.log(err);
      if (typeof err === 'object' && Object.keys(err).length === 0) {
        err = 'Mongo Error';
      }
      res.status(500).send(new responses.ErrorResponse(err));
    });
};

const completeRegistration = (req, res) => {
  const now = new Date();

  // add a registered date to the inviation document in the invitations collection
  invitationsService
    .register(req.model.invitationId, now)
    .then(() => {
      const person = {
        _id: req.model.personId,
        firstName: req.model.firstName,
        lastName: req.model.lastName,
        publicEmail: req.model.loginEmail,
        roleId: req.model.roleId,
        registeredDate: now,
        modifiedDate: now
      };

      const login = {
        loginEmail: req.model.loginEmail,
        password: req.model.password,
        salt: req.model.salt,
        personId: req.model.personId,
        tenantId: req.model.tenantId,
        enabled: true,
        lastLogin: now
      };

      const escrowPerson = req.model.escrowId
        ? { personId: req.model.personId, escrowId: req.model.escrowId }
        : null;

      const responseModel = new responses.ItemResponse();

      usersService
        .post(login)
        .then(id => {
          // add userId to response & update people collection
          responseModel.item = id;
          person.userId = id;
          login._id = id;

          // passport login
          req.login(login, err => {
            if (err) {
              console.log(err);
              if (typeof err === 'object' && Object.keys(err).length === 0) {
                err = 'Mongo Error';
              }
              return res.status(500).send(new responses.ErrorResponse(err));
            }
          });

          // update people collection if the user has a document there
          if (login.personId) {
            peopleService
              .confirmPerson(person)
              .then(() => {
                // add person to the escrow collection if they're being added to an escrow
                if (escrowPerson) {
                  escrowPeopleService
                    .create(escrowPerson)
                    .then(() => {
                      res
                        .status(201)
                        .location(`${apiPrefix}/${responseModel.item}`)
                        .json(responseModel);
                    })
                    .catch(err => {
                      console.log(err);
                      if (typeof err === 'object' && Object.keys(err).length === 0) {
                        err = 'Mongo Error';
                      }
                      res.status(500).send(new responses.ErrorResponse(err));
                    });
                } else {
                  res
                    .status(201)
                    .location(`${apiPrefix}/${responseModel.item}`)
                    .json(responseModel);
                }
              })
              .catch(err => {
                console.log(err);
                if (typeof err === 'object' && Object.keys(err).length === 0) {
                  err = 'Mongo Error';
                }
                res.status(500).send(new responses.ErrorResponse(err));
              });
          } else {
            res
              .status(201)
              .location(`${apiPrefix}/${responseModel.item}`)
              .json(responseModel);
          }
        })
        .catch(err => {
          console.log(err);
          if (typeof err === 'object' && Object.keys(err).length === 0) {
            err = 'Mongo Error';
          }
          res.status(500).send(new responses.ErrorResponse(err));
        });
    })
    .catch(err => {
      console.log(err);
      if (typeof err === 'object' && Object.keys(err).length === 0) {
        err = 'Mongo Error';
      }
      res.status(500).send(new responses.ErrorResponse(err));
    });
};

module.exports = {
  sendInvitation,
  confirmInvitation,
  completeRegistration
};
