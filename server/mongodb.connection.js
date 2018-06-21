const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

let _db = null;

function connect(url, databaseName) {
  if (_db !== null) {
    return Promise.resolve(_db);
  }

  return MongoClient.connect(url).then(client => (_db = client.db(databaseName)));
}

// _db stored via closure and can get access in file where this is imported
module.exports = {
  connect,
  connection: { db: () => _db },
  ObjectId
};
