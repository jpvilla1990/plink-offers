'use strict';

const op = require('sequelize').Op,
  errors = require('../errors'),
  { moment } = require('../utils');

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
  Code.createModel = (off, transaction) => Code.create(off, { transaction });
  Code.getBy = filter =>
    Code.findOne({ where: filter }).catch(err => {
      throw errors.databaseError(err.message);
    });
  Code.getAllBy = filter =>
    Code.findAndCountAll({
      offset: filter.offset,
      where: {
        email: filter.email,
        dateRedemption: sequelize.where(
          sequelize.fn(
            'datediff',
            moment()
              .utc()
              .format('YYYY-MM-DD HH:mm:ss'),
            sequelize.col('date_redemption')
          ),
          {
            [op.or]: {
              [op.eq]: null,
              [op.and]: {
                [op.lte]: 3,
                [op.gte]: 0
              }
            }
          }
        )
      },
      limit: filter.limit,
      include: [
        {
          model: sequelize.models.offer,
          as: 'offer',
          where: sequelize.where(
            sequelize.fn('datediff', moment().format('YYYY-MM-DD'), sequelize.col('expiration')),
            {
              [op.lte]: 3
            }
          )
        }
      ]
    }).catch(err => {
      throw errors.databaseError(err.message);
    });
  Code.associate = models => {
    Code.belongsTo(models.offer, { as: 'offer' });
  };
  return Code;
};
