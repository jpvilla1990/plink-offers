'use strict';

const errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const category = sequelize.define(
    'category',
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING
    },
    {
      paranoid: true,
      underscored: true
    }
  );

  category.findAllCategories = () => {
    return category.findAll().catch(err => {
      throw errors.databaseError(err.message);
    });
  };

  return category;
};
