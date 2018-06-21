// Services / Utilities
const peopleService = require('../services/people.service');
const responses = require('../models/responses');

const getUser = (req, res) => {
  // get user from passport session
  const user = { ...req.session.passport.user };

  // return user & associated person from collection
  peopleService
    .getPersonById(user.personId)
    .then(person => {
      res.status(200).json(new responses.ItemResponse({ ...user, person }));
    })
    .catch(err => {
      console.log(err);
      if (typeof err === 'object' && Object.keys(err).length === 0) {
        err = 'Mongo Error';
      }
      res.status(500).send(new responses.ErrorResponse(err));
    });
};

module.exports = { getUser };
