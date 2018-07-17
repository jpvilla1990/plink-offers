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
  emailUser.getAll = filter => {
    return emailUser
      .findAndCountAll({
        offset: filter.offset,
        limit: filter.limit,
        include: [
          {
            model: sequelize.models.offer,
            as: 'offer',
            include: [
              {
                model: sequelize.models.category,
                as: 'category'
              }
            ]
          }
        ]
      })
      .catch(err => {
        throw errors.databaseError(err.message);
      });
  };
  emailUser.associate = models => {
    emailUser.belongsTo(models.offer, { as: 'offer' });
  };

  return emailUser;
};
