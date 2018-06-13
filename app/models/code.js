'use strict';

const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const code = sequelize.define(
    'code',
    {
      code: DataTypes.STRING,
      email: DataTypes.STRING,
      offer: DataTypes.INTEGER,
      dateRedemption: {
        type: DataTypes.DATEONLY,
        field: 'date_redemption'
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  );
  code.createModel = off => {
    return code.create(off);
  };
  return code;
};
