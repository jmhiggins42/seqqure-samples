// Mongo
const mongodb = require('../mongodb.connection');
const conn = mongodb.connection;
const ObjectId = mongodb.ObjectId;

// Services
const transactionService = require('./transactions.service');
const milestonesService = require('./milestones.service');

// Utilities
const unflattener = require('../helpers/unflattener');

const readAllMaster = () => {
  return conn
    .db()
    .collection('escrowTemplates')
    .aggregate()
    .match({})
    .lookup({
      from: 'transactionTypes',
      localField: 'transactionTypeId',
      foreignField: '_id',
      as: 'transactionType'
    })
    .unwind('$transactionType')
    .project({
      tenantId: 1,
      transactionTypeId: 1,
      transactionType: '$transactionType.name',
      name: 1,
      days: 1,
      milestones: 1,
      sourceId: 1
    })
    .toArray()
    .then(docs =>
      docs.map(doc => {
        doc.createdDate = doc._id.getTimestamp();
        doc.transactionTypeId = doc.transactionTypeId.toString();
        doc.milestones = doc.milestones
          ? doc.milestones.map(ms => {
              ms.milestoneId = ObjectId(ms.milestoneId);
              return ms;
            })
          : [];
        return doc;
      })
    );
};

const provision = (tenantId, selectedIds, userId, tTypeResult = null, milestoneResult = null) => {
  const ids = selectedIds.map(id => ObjectId(id));
  const now = new Date();

  return conn
    .db()
    .collection('escrowTemplates')
    .aggregate()
    .match({ _id: { $in: ids } })
    .unwind('$milestones')
    .group({
      _id: '$_id',
      name: { $last: '$name' },
      days: { $last: '$days' },
      milestoneIds: { $addToSet: '$milestones.milestoneId' },
      milestones: { $push: '$milestones' },
      transactionTypeId: { $last: '$transactionTypeId' },
      tenantId: { $last: ObjectId(tenantId) },
      createdById: { $last: ObjectId(userId) },
      modifiedById: { $last: ObjectId(userId) },
      modifiedDate: { $last: now }
    })
    .project({
      milestoneIds: 1,
      name: 1,
      days: 1,
      milestones: 1,
      transactionTypeId: 1,
      tenantId: 1,
      createdById: 1,
      modifiedById: 1,
      modifiedDate: 1,
      sourceId: '$_id',
      _id: 0
    })
    .toArray()
    .then(docs => {
      // Get arrays of tTypes & milestones to lookup
      const milestoneMap = docs.reduce((acc, curr) => {
        acc.push(curr.milestoneIds);
        return acc;
      }, []);
      const milestoneIds = milestoneMap.reduce((acc, curr) => acc.concat(curr));
      const tTypeIds = docs.reduce((acc, curr) => acc.concat(curr.transactionTypeId), []);

      // Lookup the tenant's version of each transactionType, milestone
      const sourceTTypePromises = [];
      const sourceMilestonePromises = [];

      tTypeIds.forEach(tTypeId => {
        sourceTTypePromises.push(
          conn
            .db()
            .collection('transactionTypes')
            .findOne({
              tenantId: ObjectId(tenantId),
              sourceId: tTypeId
            })
            .then(tType => (tType ? tType._id : null))
        );
      });

      milestoneIds.forEach(mId => {
        sourceMilestonePromises.push(
          conn
            .db()
            .collection('milestones')
            .findOne({
              tenantId: ObjectId(tenantId),
              sourceId: mId
            })
            .then(milestone => (milestone ? milestone._id : null))
        );
      });

      const megaPromise = [Promise.all(sourceTTypePromises), Promise.all(sourceMilestonePromises)];

      // Once all lookups are complete, check if tenant needs to provision any transactionTypes or milestones
      return Promise.all(megaPromise).then(provisionedIds => {
        const [tTypeResponses, milestoneResponses] = provisionedIds;

        // If a lookup failed, record the transactionType that needs to be provisioned
        const tTypesToProvision = tTypeResponses
          .map((id, i) => (id ? null : tTypeIds[i]))
          .filter(el => el);

        const milestonesToProvision = milestoneResponses
          .map((id, i) => (id ? null : milestoneIds[i]))
          .filter(el => el);

        // Provision transactionTypes or milestones if needed, than recursively call this provision again
        if (tTypesToProvision.length !== 0) {
          return transactionService.provision(tenantId, tTypesToProvision, userId).then(result => {
            return provision(tenantId, selectedIds, userId, result);
          });
        }

        if (milestonesToProvision.length !== 0) {
          return milestonesService
            .provision(tenantId, milestonesToProvision, userId)
            .then(result => {
              return provision(tenantId, selectedIds, userId, tTypeResult, result);
            });
        }

        const milestoneResponseMap = unflattener(milestoneResponses, milestoneMap);

        // Overwrite the original transactionTypeId with the tenant-version's id
        docs.forEach((doc, i) => {
          doc.transactionTypeId = tTypeResponses[i];
          doc.milestones.forEach((mstone, j) => {
            mstone.milestoneId = milestoneResponseMap[i][j];
          });
          delete doc.milestoneIds;
        });

        // Write to escrowTemplates
        return conn
          .db()
          .collection('escrowTemplates')
          .insertMany(docs)
          .then(result => ({
            escrowTemplates: {
              insertedCount: result.insertedCount,
              insertedIds: result.insertedIds
            },
            transactionTypes: tTypeResult,
            milestones: milestoneResult
          }));
      });
    });
};

module.exports = {
  readAllMaster,
  provision
};
