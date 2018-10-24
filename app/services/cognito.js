const AWS = require('aws-sdk'),
  errors = require('../errors'),
  config = require('../../config').common.aws,
  cognito = new AWS.CognitoIdentityServiceProvider(
    new AWS.Config({
      accessKeyId: config.key,
      secretAccessKey: config.secret,
      region: config.region
    })
  );

exports.cognito = cognito;
exports.checkEmail = Username =>
  cognito
    .adminGetUser({
      Username,
      UserPoolId: config.pool_id_users_app
    })
    .promise()
    .then(() => ({ exist: true }))
    .catch(err => {
      if (err.code === 'UserNotFoundException') return { exist: false };
      throw errors.badRequest(err.code);
    });
