const { GENDER, RANGE } = require('../constants'),
  sequelize = require('../models').sequelize,
  Target = require('../models').target;

const getTargets = type =>
  Target.findAll({
    where: { type }
  });
exports.getAllGenders = () => getTargets(GENDER);
exports.getAgeRanges = () => getTargets(RANGE);
