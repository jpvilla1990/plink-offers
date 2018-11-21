const User = require('../models').user,
  cognitoService = require('../services/cognito');

exports.updateFirstLogin = (req, res, next) =>
  cognitoService
    .updateFirstLogin(req.email)
    .then(() => {
      res.status(200).end();
    })
    .catch(next);
