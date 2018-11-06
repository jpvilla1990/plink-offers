const { GENDER, RANGE } = require('../constants'),
  Sequelize = require('sequelize'),
  Op = Sequelize.Op,
  errors = require('../errors'),
  Target = require('../models').target;

const getTargets = type =>
  Target.findAll({
    where: { type }
  });
exports.getAllGenders = () => getTargets(GENDER);
exports.getAgeRanges = () => getTargets(RANGE);
exports.getByDescriptions = descriptions =>
  Target.findAll({
    where: {
      description: {
        [Op.in]: descriptions
      }
    }
  }).catch(err => {
    throw errors.databaseError(err.message);
  });
