const Code = require('../models').code,
  Offer = require('../models').offer,
  moment = require('moment'),
  { getOfferStatus } = require('../utils'),
  { OFFER_ACTIVE, OFFER_INACTIVE } = require('../constants'),
  sequelize = require('../models').sequelize,
  Op = sequelize.Op,
  errors = require('../errors');

exports.getCode = ({ retailId, number }) =>
  Code.findOne({
    where: { code: number },
    include: [
      {
        model: Offer,
        as: 'offer',
        where: { retail: retailId },
        require: true
      }
    ]
  }).then(code => {
    if (code) {
      return code;
    }
    throw errors.codeNotFound;
  });

exports.getRedemptions = filter => {
  return Code.findAndCountAll({
    offset: filter.offset,
    where: { offerId: filter.id, dateRedemption: { [Op.ne]: null } },
    limit: filter.limit
  }).catch(err => {
    throw errors.databaseError(err.message);
  });
};
exports.redeemCode = ({ retailId, code }) =>
  sequelize.transaction(transaction =>
    Code.findOne({
      where: { code },
      lock: transaction.LOCK.UPDATE,
      include: [
        {
          model: Offer,
          as: 'offer',
          where: { retail: retailId },
          require: true,
          lock: transaction.LOCK.UPDATE
        }
      ],
      transaction
    }).then(result => {
      if (result) {
        if (result.dateRedemption === null) {
          const status = getOfferStatus(result.offer.dataValues);
          if (status === OFFER_ACTIVE) {
            return result.offer
              .increment({ redemptions: 1 }, { transaction })
              .then(() => result.update({ dateRedemption: moment() }, { transaction }))
              .catch(err => {
                throw errors.databaseError(err.message);
              });
          } else {
            if (status === OFFER_INACTIVE) throw errors.offerInactive;
            else throw errors.offerDisabled;
          }
        } else {
          throw errors.codeRedeemed;
        }
      } else {
        throw errors.codeNotFound;
      }
    })
  );
