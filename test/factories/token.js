const jwt = require('jwt-simple'),
  config = require('../../config');

exports.generate = ({ email, points, offers = true }) =>
  jwt.encode({ email, points, offers }, config.common.session.secret);
