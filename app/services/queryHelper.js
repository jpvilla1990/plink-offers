const sequelize = require('../models').sequelize,
  Sequelize = require('sequelize'),
  Op = Sequelize.Op;

exports.likeConditionsWithConcat = conditions =>
  sequelize.where(sequelize.fn('concat', ...conditions.params), {
    [Op.like]: `%${conditions.value.toLowerCase()}%`
  });
exports.likeByField = ({ field, filter }) =>
  sequelize.where(sequelize.fn('lower', sequelize.col(field)), {
    [Op.like]: `%${filter.toLowerCase()}%`
  });
