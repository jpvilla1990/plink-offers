'use strict';

const errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const target = sequelize.define(
    'target',
    {
      description: DataTypes.STRING,
      type: DataTypes.STRING,
      alias: DataTypes.STRING
    },
    {
      paranoid: true,
      underscored: true
    }
  );
  return target;
};
