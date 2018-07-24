const jwt = require('jwt-simple'),
  config = require('../../config');

exports.generate = value => jwt.encode(value, config.common.session.secret);
