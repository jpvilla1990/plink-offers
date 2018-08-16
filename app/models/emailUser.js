'use strict';

const errors = require('../errors'),
  Sequelize = require('sequelize');

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
    const where = filter.category ? { categoryId: filter.category } : null;
    return emailUser
      .findAll({
        offset: filter.offset,
        limit: filter.limit,
        where: { email: filter.email },
        include: [
          {
            model: sequelize.models.offer,
            as: 'offer',
            where,
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
  emailUser.createModel = newEmailUser =>
    emailUser.create(newEmailUser).catch(err => {
      if (err instanceof Sequelize.UniqueConstraintError && err.fields.email_users_email_offer_id) {
        throw errors.existingUser;
      } else {
        throw errors.databaseError(err.message);
      }
    });
  emailUser.getBy = filter =>
    emailUser.findOne({ where: filter }).catch(err => {
      throw errors.databaseError(err.message);
    });
  emailUser.associate = models => {
    emailUser.belongsTo(models.offer, { as: 'offer' });
  };

  return emailUser;
};
