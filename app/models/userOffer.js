'use strict';

const errors = require('../errors'),
  Sequelize = require('sequelize');

const Op = Sequelize.Op;
const utils = require('../utils');

const validOfferConstraint = today => [
  {
    begin: {
      [Op.lte]: today
    }
  },
  {
    expiration: {
      [Op.gte]: today
    }
  },
  {
    redemptions: {
      [Op.lt]: Sequelize.col('offer.max_redemptions')
    }
  },
  {
    active: true
  }
];

module.exports = (sequelize, DataTypes) => {
  const userOffer = sequelize.define(
    'user_offer',
    {
      email: DataTypes.STRING,
      offerId: {
        type: DataTypes.INTEGER,
        field: 'offer_id'
      },
      hashEmail: {
        type: DataTypes.STRING,
        field: 'hash_email'
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  );
  userOffer.getAll = filter => {
    const today = utils.moment();
    const offerFiltering = {
      [Op.and]: [
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('product')), {
          [Op.like]: `%${filter.name.toLowerCase()}%`
        })
      ].concat(validOfferConstraint(today))
    };
    if (filter.category) offerFiltering.categoryId = filter.category;
    return userOffer
      .findAll({
        offset: filter.offset,
        limit: filter.limit,
        where: {
          email: filter.email
        },
        include: [
          {
            model: sequelize.models.offer,
            as: 'offer',
            where: offerFiltering,
            include: [
              {
                model: sequelize.models.category,
                as: 'category'
              },
              {
                model: sequelize.models.code,
                as: 'code',
                where: { email: filter.email },
                required: false
              }
            ]
          }
        ]
      })
      .catch(err => {
        throw errors.databaseError(err.message);
      });
  };
  userOffer.createModel = newEmailUser =>
    userOffer.create(newEmailUser).catch(err => {
      if (err instanceof Sequelize.UniqueConstraintError && err.fields.email_users_email_offer_id) {
        throw errors.existingUser;
      } else {
        throw errors.databaseError(err.message);
      }
    });
  userOffer.getBy = filter =>
    userOffer.findOne({ where: filter }).catch(err => {
      throw errors.databaseError(err.message);
    });
  userOffer.associate = models => {
    userOffer.belongsTo(models.offer, { as: 'offer' });
  };

  return userOffer;
};
