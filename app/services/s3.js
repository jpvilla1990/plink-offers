const AWS = require('aws-sdk'),
  config = require('../../config'),
  uuid = require('uuid'),
  s3 = new AWS.S3(
    new AWS.Config({
      accessKeyId: config.common.aws.key,
      secretAccessKey: config.common.aws.secret,
      region: config.common.aws.region
    })
  );

exports.getSignedUrlPut = key => exports.getSignedUrl(key, 'putObject');

exports.getSignedUrl = (key, action = 'getObject') => {
  const s3Params = {
    Bucket: config.common.aws.bucket,
    Key: key || uuid()
  };
  return new Promise((resolve, reject) => {
    s3.getSignedUrl(action, s3Params, (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
};
