'use strict';

const Sequelize = require('sequelize');

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
  Code.associate = models => {
    Code.belongsTo(models.offer, { as: 'offer' });
  };
  return Code;
};
