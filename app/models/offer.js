const errors = require('../errors');

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
      imageUrl: {
        type: DataTypes.STRING,
        field: 'image_url'
      },
      valueStrategy: {
        type: DataTypes.STRING,
        field: 'value_type_offer'
      },
      categoryId: {
        type: DataTypes.INTEGER,
        field: 'category_id'
      },
      codes: {
        type: DataTypes.INTEGER
      },
      redemptions: {
        type: DataTypes.INTEGER
      },
      nit: {
        type: DataTypes.INTEGER
      },
      active: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  );
  Offer.createModel = (off, transaction) =>
    Offer.create(off, {
      include: [
        {
          model: sequelize.models.category,
          as: 'category'
        }
      ],
      transaction
    }).catch(err => {
      throw errors.databaseError(err.message);
    });
  Offer.getBy = filter =>
    Offer.findOne({
      where: filter,
      include: [
        {
          model: sequelize.models.category,
          as: 'category'
        },
        {
          model: sequelize.models.type_offer,
          as: 'type'
        }
      ]
    }).catch(err => {
      throw errors.databaseError(err.message);
    });
  Offer.incrementField = (field, filter, transaction) =>
    Offer.increment(field, { where: filter, transaction }).catch(err => {
      throw errors.databaseError(err.detail);
    });
  Offer.getAllDashboardBy = filter =>
    Offer.findAndCountAll({
      offset: filter.offset,
      where: { retail: filter.retail },
      limit: filter.limit,
      order: [['created_at', 'DESC']]
    }).catch(err => {
      throw errors.databaseError(err.message);
    });
  Offer.associate = models => {
    Offer.belongsTo(models.category, { as: 'category' });
    Offer.belongsTo(models.type_offer, { as: 'type', foreignKey: 'strategy' });
    Offer.hasMany(models.code, { as: 'code' });
  };
  return Offer;
};