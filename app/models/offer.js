const errors = require('../errors'),
  logger = require('../logger');

('use strict');

module.exports = (sequelize, DataTypes) => {
  const Offer = sequelize.define(
    'offer',
    {
      product: {
        type: DataTypes.STRING
      },
      begin: {
        type: DataTypes.DATEONLY
      },
      expiration: {
        type: DataTypes.DATEONLY
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
      },
      codes: {
        type: DataTypes.INTEGER
      },
      redemptions: {
        type: DataTypes.INTEGER
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  );
  Offer.createModel = off => {
    return Offer.create(off).catch(err => {
      throw errors.databaseError(err.message);
    });
  };
  Offer.getBy = filter => {
    return Offer.findOne({ where: filter }).catch(err => {
      throw errors.databaseError(err.message);
    });
  };
  Offer.incrementField = (field, filter) => {
    return Offer.increment(field, { where: filter }).catch(err => {
      throw errors.databaseError(err.detail);
    });
  };
  Offer.getAllBy = filter => {
    return Offer.findAndCountAll({
      offset: filter.offset,
      where: { retail: filter.retail },
      limit: filter.limit
    }).catch(err => {
      throw errors.databaseError(err.message);
    });
  };
  return Offer;
};
