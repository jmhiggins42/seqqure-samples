const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Services
const peopleService = require('./services/people.service');
const usersService = require('./services/users.service');

module.exports = passport;

passport.serializeUser((user, cb) => {
  const response = {
    _id: user._id.toString(),
    email: user.loginEmail,
    tenantId: user.tenantId.toString(),
    personId: user.personId ? user.personId.toString() : null,
    enabled: user.enabled
  };

  if (response.personId) {
    peopleService.getPersonById(response.personId).then(person => {
      response.roles = person.roles.map(role => role.toString());
      response.name = `${person.firstName} ${person.lastName}`;
      cb(null, response);
    });
  } else {
    response.roles = [user.role.toString()];
    cb(null, response);
  }
});

passport.deserializeUser((user, cb) => {
  usersService
    .getById(user._id)
    .then(user => cb(null, user))
    .catch(err => cb(err));
});

// Authentication strategy to check against MongoDB store of users collection
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
      session: true
    },
    (req, email, password, done) => {
      usersService
        .getByEmailTenantId(email, req.body.tenantId)
        .then(user => {
          // Case 1: Fails if user can't be found
          if (!user) {
            return done(null, false);
          }
          // Hash inputted password
          crypto.pbkdf2(
            password, // inputted password to hash
            user.salt, // user's stored salt
            100000,
            64,
            'sha512',
            (err, derivedKey) => {
              // Case 2: Fails if hashing algorithm err's
              if (err) {
                return done(err);
              }

              // Case 3: Fails if hashes don't match
              if (user.password !== derivedKey.toString('hex')) {
                return done(null, false);
              }

              // Success
              return done(null, user);
            }
          );
        })
        // Case 4: Fails if mongo search errors out
        .catch(err => done(err));
    }
  )
);
