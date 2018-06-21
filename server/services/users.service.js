// Mongo
const mongodb = require('../mongodb.connection');
const conn = mongodb.connection;
const ObjectId = mongodb.ObjectId;

const post = user => {
  user.personId = user.personId ? ObjectId(user.personId) : null;
  user.tenantId = ObjectId(user.tenantId);

  return conn
    .db()
    .collection('users')
    .insertOne(user)
    .then(result => result.insertedId.toString())
    .catch(err => Promise.reject(err));
};

const onLogin = (id, time) => {
  return conn
    .db()
    .collection('users')
    .updateOne({ _id: ObjectId(id) }, { $set: { lastLogin: time } });
};

// For multi-step login process
const getTenantsByEmail = email => {
  return conn
    .db()
    .collection('users')
    .aggregate()
    .match({ loginEmail: new RegExp(`^${email.toLowerCase()}$`, 'i') })
    .lookup({
      from: 'tenants',
      localField: 'tenantId',
      foreignField: '_id',
      as: 'tenant'
    })
    .unwind('$tenant')
    .project({ tenant: 1, _id: 0 })
    .toArray()
    .then(array => array.map(el => el.tenant));
};

const getByEmailTenantId = (email, tenantId) => {
  return conn
    .db()
    .collection('users')
    .findOne({
      loginEmail: new RegExp(`^${email.toLowerCase()}$`, 'i'),
      tenantId: ObjectId(tenantId)
    });
};

const getById = id => {
  return conn
    .db()
    .collection('users')
    .findOne({ _id: ObjectId(id) })
    .then(user => {
      user._id = user._id.toString();
      user.personId = user.personId ? user.personId.toString() : null;
      user.tenantId = user.tenantId.toString();
      return user;
    });
};

module.exports = {
  post,
  onLogin,
  getTenantsByEmail,
  getByEmailTenantId,
  getById
};
