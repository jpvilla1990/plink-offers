const errors = require('../errors'),
  jwt = require('jwt-simple'),
  config = require('../../config').common.session,
  logger = require('../logger'),
  headerName = config.header_name,
  algorithm = config.algorithm;

exports.requireToken = (req, res, next) => {
  if (req.headers && req.headers[headerName]) {
    try {
      const token = req.headers[headerName].split(' ')[1];
      const user = jwt.decode(token, null, true, algorithm);
      if (!user.points.includes(req.params.id)) {
        next(errors.userUnauthorized);
      } else {
        req.retail = req.params.id;
        next();
      }
    } catch (err) {
      next(errors.badToken);
    }
  } else {
    next(errors.userUnauthorized);
  }
};
