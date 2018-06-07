const AWS = require('aws-sdk'),
  config = require('../../config'),
  logger = require('../logger'),
  s3 = new AWS.S3(
    new AWS.Config({
      accessKeyId: config.common.aws.key,
      secretAccessKey: config.common.aws.secret,
      region: config.common.aws.region
    })
  );

exports.getUrl = (id, extension) => {
  const s3Params = {
    Bucket: config.common.aws.bucket,
    Key: `offer-${id}.${extension}`,
    Expires: config.common.aws.expiration
  };
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', s3Params, (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
};
