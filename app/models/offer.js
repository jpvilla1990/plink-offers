const errors = require('../errors'),
  logger = require('../logger');

('use strict');

module.exports = (sequelize, DataTypes) => {
  const offer = sequelize.define(
    'offer',
    {
      product: {
        type: DataTypes.STRING
      },
      begin: {
        type: DataTypes.DATE
      },
      expiration: {
        type: DataTypes.DATE
      },
      strategy: {
        type: DataTypes.INTEGER
      },
      maxRedemptions: {
        type: DataTypes.INTEGER,
        field: 'max_redemptions'
      },
      retail: {
        type: DataTypes.INTEGER,
        unique: true
      },
      purpose: {
        type: DataTypes.STRING
      },
      imgExtension: {
        type: DataTypes.STRING,
        field: 'img_extension'
      },
      valueStrategy: {
        type: DataTypes.STRING,
        field: 'value_type_offer'
      },
      category: {
        type: DataTypes.INTEGER
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  );
  offer.createModel = off => {
    return offer.create(off).catch(err => {
      throw errors.databaseError(err.message);
    });
  };
  offer.getBy = filter => {
    return offer.findOne({ where: filter }).catch(err => {
      throw errors.databaseError(err.message);
    });
  };
  offer.associate = function(models) {
    // associations can be defined here
  };
  return offer;
};
