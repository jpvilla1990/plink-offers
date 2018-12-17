const rp = require('request-promise'),
  errors = require('../errors'),
  config = require('../../config');

exports.getPoints = id =>
  rp({
    uri: `${config.common.server.info_retail}/points/${id}`,
    json: true
  }).catch(() => {
    throw errors.points;
  });
