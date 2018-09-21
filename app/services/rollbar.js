const config = require('../../config'),
  rollbar = require('rollbar').init({
    accessToken: config.common.rollbar.accessToken,
    environment: config.common.rollbar.environment
  });

exports.error = (message, request) => rollbar.error(new Error(message), request);
