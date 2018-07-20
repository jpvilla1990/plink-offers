'use strict';

const Sequelize = require('sequelize'),
  errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const Code = sequelize.define(
    'code',
    {
      code: DataTypes.STRING,
      email: DataTypes.STRING,
      offerId: { type: DataTypes.INTEGER, field: 'offer_id' },
      dateRedemption: { type: DataTypes.DATE, field: 'date_redemption' }
    },
    {
      paranoid: true,
      underscored: true,
      indexes: [{ unique: true, fields: ['email', 'offer_id'] }]
    }
  );
  Code.createModel = off => {
    return Code.create(off);
  };
  Code.getBy = filter => {
    return Code.findOne({ where: filter }).catch(err => {
      throw errors.databaseError(err.message);
    });
  };
  Code.getAllBy = filter => {
    return Code.findAll({
      offset: filter.offset,
      where: { email: filter.email },
      limit: filter.limit,
      include: [
        {
          model: sequelize.models.offer,
          as: 'offer'
        }
      ]
    }).catch(err => {
      throw errors.databaseError(err.message);
    });
  };
  Code.associate = models => {
    Code.belongsTo(models.offer, { as: 'offer' });
  };
  return Code;
};
