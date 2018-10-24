const Target = require('../models').target,
  targetService = require('../services/target');

exports.getAllGenders = (req, res, next) =>
  targetService
    .getAllGenders()
    .then(result => res.send({ result }))
    .catch(next);
exports.getAgeRanges = (req, res, next) =>
  targetService
    .getAgeRanges()
    .then(result => res.send({ result }))
    .catch(next);
