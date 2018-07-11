const Code = require('../models').code,
  Offer = require('../models').offer,
  moment = require('moment'),
  { getOfferStatus } = require('../utils'),
  sequelize = require('../models').sequelize,
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
    where: { offerId: filter.id },
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
          const statusOffer = getOfferStatus(result.offer.dataValues);
          if (statusOffer) {
            return result.offer
              .increment({ redemptions: 1 }, { transaction })
              .then(() => result.update({ dateRedemption: moment() }, { transaction }))
              .catch(err => {
                throw errors.databaseError(err.message);
              });
          } else {
            throw errors.offerInactive;
          }
        } else {
          throw errors.codeRedeemed;
        }
      } else {
        throw errors.codeNotFound;
      }
    })
  );
