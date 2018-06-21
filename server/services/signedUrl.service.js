// Configure AWS w/ credentials
const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();

const getMobileObjectDocs = (filename, cb) => {
  const params = {
    Bucket: process.env.S3_DOCS,
    Key: filename,
    Expires: 600
  };

  s3.getSignedUrl('getObject', params, cb);
};

function signedUrl(filename, filetype, callBack) {
  var params = {
    Bucket: process.env.S3_PUBLIC,
    Key: filename,
    Expires: 60,
    ContentType: filetype
  };

  s3.getSignedUrl('putObject', params, callBack);
}

module.exports = {
  signedUrl,
  getMobileObjectDocs
};
