// Mongo
const mongodb = require('../mongodb.connection');
const conn = mongodb.connection;
const ObjectId = mongodb.ObjectId;
const coll = 'documentType';

const getAllMaster = () => {
  return conn
    .db()
    .collection(coll)
    .find()
    .toArray()
    .then(docs =>
      docs.map(doc => {
        doc.createdDate = doc._id.getTimestamp();
        return doc;
      })
    );
};

const provision = (tenantId, selectedIds, userId) => {
  const ids = selectedIds.map(id => ObjectId(id));
  return conn
    .db()
    .collection(coll)
    .aggregate()
    .match({ _id: { $in: ids } })
    .project({
      docuName: 1,
      docuCode: 1,
      displayOrder: 1,
      isObsolete: 1,
      tenantId: ObjectId(tenantId),
      createdById: ObjectId(userId),
      modifiedById: ObjectId(userId),
      modifiedDate: new Date(),
      sourceId: '$_id',
      _id: 0
    })
    .toArray()
    .then(docs => {
      return conn
        .db()
        .collection(coll)
        .insertMany(docs)
        .then(result => ({
          insertedCount: result.insertedCount,
          insertedIds: result.insertedIds
        }));
    });
};

module.exports = {
  getAllMaster,
  provision
};
