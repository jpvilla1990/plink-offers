'use strict';

module.exports = (sequelize, DataTypes) => {
  const typeOferr = sequelize.define(
    'typeOferr',
    {
      title: DataTypes.STRING,
      count: DataTypes.STRING
    },
    {
      paranoid: true,
      underscored: true
    }
  );
  typeOferr.associate = function(models) {
    // associations can be defined here
  };
  return typeOferr;
};
