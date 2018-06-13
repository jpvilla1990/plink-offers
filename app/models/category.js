'use strict';

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
  return category;
};
