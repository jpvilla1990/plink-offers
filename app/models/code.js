'use strict';

const op = require('sequelize').Op,
  errors = require('../errors'),
  { moment } = require('../utils');

module.exports = (sequelize, DataTypes) => {
  const beforeThreeDaysCondition = params =>
    sequelize.where(
      sequelize.fn('datediff', moment().format('YYYY-MM-DD'), sequelize.col(params.column)),
      params.condition
    );

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
      order: [
        [sequelize.models.offer, 'active', 'DESC'],
        [sequelize.literal('`offer.status` DESC')],
        ['date_redemption', 'ASC']
      ],
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
          attributes: [
            'id',
            'begin',
            'expiration',
            'product',
            ['max_redemptions', 'maxRedemptions'],
            ['value_type_offer', 'valueStrategy'],
            'retail',
            ['image_url', 'imageUrl'],
            'strategy',
            ['category_id', 'categoryId'],
            'nit',
            'active',
            ['email_creator', 'creator'],
            'redemptions',
            [
              sequelize.literal(
                `CASE WHEN begin <= '${moment().format('YYYY-MM-DD')}' and expiration >= '${moment().format(
                  'YYYY-MM-DD'
                )}' then 1 else 0 end`
              ),
              'status'
            ]
          ],
          where: {
            [op.or]: [
              beforeThreeDaysCondition({ column: 'expiration', condition: { [op.lte]: 3 } }),
              {
                [op.and]: [
                  { active: { [op.eq]: false } },
                  beforeThreeDaysCondition({ column: 'date_inactive', condition: { [op.gte]: -3 } })
                ]
              }
            ]
          }
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
