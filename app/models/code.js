'use strict';

module.exports = (sequelize, DataTypes) => {
  const code = sequelize.define(
    'code',
    {
      code: DataTypes.STRING,
      email: DataTypes.STRING,
      offer: DataTypes.INTEGER,
      dateRedemption: DataTypes.DATE
    },
    {
      paranoid: true,
      underscored: true
    }
  );
  return code;
};
