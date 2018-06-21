const mongodb = require('../mongodb.connection');
const conn = mongodb.connection;
const ObjectId = mongodb.ObjectId;

const post = invitation => {
  invitation.personId = ObjectId(invitation.personId);
  invitation.tenantId = ObjectId(invitation.tenantId);
  invitation.roleId = ObjectId(invitation.roleId);
  invitation.escrowId = invitation.escrowId ? ObjectId(invitation.escrowId) : null;

  return conn
    .db()
    .collection('invitations')
    .insertOne(invitation)
    .then(result => result.insertedId.toString());
};

const register = (id, time) => {
  return conn
    .db()
    .collection('invitations')
    .updateOne({ _id: ObjectId(id) }, { $set: { registeredDate: time } })
    .then(() => Promise.resolve());
};

const getById = token => {
  return conn
    .db()
    .collection('invitations')
    .findOne({ _id: ObjectId(token) })
    .then(invitation => invitation);
};

module.exports = {
  post,
  register,
  getById
};
