'use strict';

const errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const category = sequelize.define(
    'category',
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      special: DataTypes.BOOLEAN
    },
    {
      paranoid: true,
      underscored: true
    }
  );

  category.findAllCategories = condition =>
    category.findAll({ where: condition, order: [['special', 'DESC']] }).catch(err => {
      throw errors.databaseError(err.message);
    });
  category.getBy = (filter, transaction = null) =>
    category.findOne({ where: filter, transaction }).catch(err => {
      throw errors.databaseError(err.message);
    });
  return category;
};
