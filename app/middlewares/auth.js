const errors = require('../errors'),
  jwt = require('jwt-simple'),
  config = require('../../config').common.session,
  logger = require('../logger'),
  headerName = config.header_name,
  algorithm = config.algorithm;

const validateToken = (request, next) => {
  if (request.headers && request.headers[headerName]) {
    try {
      const token = request.headers[headerName].split(' ')[1];
      const user = jwt.decode(token, null, true, algorithm);
      return user;
    } catch (err) {
      next(errors.userUnauthorized);
    }
  } else {
    next(errors.userUnauthorized);
  }
};
exports.requireRetail = (req, res, next) => {
  const user = validateToken(req, next);
  if (user.points && user.points.includes(req.params.id) && user.offers) {
    req.retail = req.params.id;
    req.user = user;
    next();
  } else {
    next(errors.userUnauthorized);
  }
};
exports.requireEmail = (req, res, next) => {
  const user = validateToken(req, next);
  if (!user.email) {
    next(errors.userUnauthorized);
  } else {
    req.user = user;
    next();
  }
};
