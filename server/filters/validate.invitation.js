const utilityFuncs = require('../helpers/utilities');

const peopleService = require('../services/people.service');
const securityService = require('../services/security.service');
const tenantsService = require('../services/tenants.service');
const escrowsService = require('../services/escrow.service');

const responses = require('../models/responses');

const validate = (req, res, next) => {
  // Step 1: Confirm person
  peopleService
    .getPersonById(req.body.personId)
    .then(person => {
      if (!person.firstName || !person.lastName || !person.publicEmail) {
        res
          .status(403)
          .send(
            new responses.ErrorResponse(
              'Person must have first name, last name, and email address before an invitation can be sent'
            )
          );
        return;
      }
      // Step 2: add person to the model
      req.model = person;
      req.model.tenantId = req.model.tenantId.toString();

      // Step 3: Get role
      securityService
        .getHighestRole(req.model.roles)
        .then(role => {
          req.model.role = role.name;
          req.model.roleId = role._id;

          // Step 4: Confirm tenant
          tenantsService
            .readById(req.model.tenantId)
            .then(tenant => {
              // Step 5: add tenant name to model
              req.model.tenantName = tenant.tenantName;

              // Step 6: Confirm escrow
              if (req.body.escrowId) {
                escrowsService
                  .readById(req.body.escrowId)
                  .then(escrow => {
                    const address = {
                      street: escrow.street,
                      suite: escrow.suite || null,
                      city: escrow.city,
                      state: escrow.state,
                      zip: escrow.zip
                    };

                    // Step 7: add escrow to model
                    req.model.escrowId = escrow._id;
                    req.model.escrowNumber = escrow.escrowNumber;
                    req.model.propertyAddress = utilityFuncs.printAddress(address);
                    req.model.transactionType = escrow.transactionType;

                    next();
                    return;
                  })
                  .catch(err => {
                    res.status(500).send(new responses.ErrorResponse('Escrow not found'));
                    return;
                  });
              } else {
                next();
                return;
              }
            })
            .catch(err => {
              res.status(500).send(new responses.ErrorResponse('Tenant not found'));
              return;
            });
        })
        .catch(err => {
          res.status(500).send(new responses.ErrorResponse('Invalid role code'));
          return;
        });
    })
    .catch(err => {
      res.status(500).send(new responses.ErrorResponse('No person found'));
      return;
    });
};

module.exports = validate;
