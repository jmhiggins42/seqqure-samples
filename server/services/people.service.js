// Mongo
const mongodb = require('../mongodb.connection');
const conn = mongodb.connection;
const ObjectId = mongodb.ObjectId;

// Completes registration process for people
const confirmPerson = person => {
  return conn
    .db()
    .collection('people')
    .updateOne(
      { _id: ObjectId(person._id) },
      {
        $set: {
          firstName: person.firstName,
          lastName: person.lastName,
          userId: ObjectId(person.userId),
          registeredDate: person.registeredDate,
          modifiedDate: person.modifiedDate,
          modifiedById: ObjectId(person.userId)
        },
        $addToSet: { roles: ObjectId(person.roleId) }
      }
    );
};

// Gets people by email & tenantId match
const getByEmailTenantId = (email, tenantId) => {
  return conn
    .db()
    .collection('people')
    .findOne({
      publicEmail: new RegExp(`^${email.toLowerCase()}$`, 'i'),
      tenantId: ObjectId(tenantId)
    });
};

// Gets people by tenantId match ONLY
const getByTenantId = tenantId => {
  return conn
    .db()
    .collection('people')
    .find({ tenantId: ObjectId(tenantId) })
    .toArray();
};

// Gets person by their _id
const getPersonById = id => {
  return conn
    .db()
    .collection('people')
    .findOne({ _id: ObjectId(id) });
};

const post = person => {
  person.roles = person.roles.map(role => ObjectId(role));
  return conn
    .db()
    .collection('people')
    .insertOne(person)
    .then(result => result.insertedId.toString());
};

module.exports = {
  confirmPerson,
  getByEmailTenantId,
  getByTenantId,
  getPersonById,
  post
};
