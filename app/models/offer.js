'use strict';

module.exports = (sequelize, DataTypes) => {
  const oferta = sequelize.define(
    'oferta',
    {
      title: {
        type: DataTypes.STRING
      },
      detail: {
        type: DataTypes.STRING
      },
      begin: {
        type: DataTypes.DATE
      },
      expiration: {
        type: DataTypes.DATE
      },
      category: {
        type: DataTypes.INTEGER
      },
      type: {
        type: DataTypes.INTEGER
      },
      minAge: {
        type: DataTypes.INTEGER,
        field: 'min_age'
      },
      maxAge: {
        type: DataTypes.INTEGER,
        field: 'max_age'
      },
      gender: {
        type: DataTypes.STRING
      },
      maxRedemptions: {
        type: DataTypes.INTEGER,
        field: 'max_redemptions'
      },
      terms: {
        type: DataTypes.STRING
      },
      post: {
        type: DataTypes.INTEGER,
        unique: true
      },
      purpose: {
        type: DataTypes.STRING
      },
      img: {
        type: DataTypes.STRING
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  );
  oferta.associate = function(models) {
    // associations can be defined here
  };
  return oferta;
};
