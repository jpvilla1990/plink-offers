'use strict';

const errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const emailUser = sequelize.define(
    'email_user',
    {
      email: DataTypes.STRING,
      offerId: {
        type: DataTypes.INTEGER,
        field: 'offer_id'
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  );
  emailUser.associate = models => {
    emailUser.belongsTo(models.offer, { as: 'offer' });
  };
  return emailUser;
};
