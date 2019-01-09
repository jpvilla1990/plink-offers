const codeService = require('../services/code'),
  utils = require('../utils'),
  errors = require('../errors'),
  Offer = require('../models').offer,
  config = require('../../config'),
  offerCodeLength = config.common.code_offer_length,
  uniqueCode = require('../services/uniqueCode'),
  { sendNewCode, sendOfferExpired } = require('../services/mailer'),
  {
    OFFER_DISABLED,
    OFFER_INACTIVE,
    OFFER_ACTIVE,
    OFFER_FINISHED,
    OFFER_OUT_OF_STOCK
  } = require('../constants'),
  { getOfferStatus } = require('../utils'),
  uuid = require('uuid');

const changeCode = code => {
  const result = {
    email: utils.mask(code.email),
    code: code.code,
    dateRedemption: code.dateRedemption
      ? utils.moment(code.dateRedemption).format('YYYY-MM-DD HH:mm:ss')
      : null,
    status: utils.getOfferStatus(code.offer.dataValues),
    product: code.offer.product,
    image: code.offer.dataValues.imageUrl
  };
  return result;
};

exports.redeemCode = ({ params }, res, next) =>
  codeService
    .redeemCode({ retailId: params.id, code: params.code })
    .then(code => {
      res.status(200).send(changeCode(code));
    })
    .catch(next);

exports.getCode = ({ params }, res, next) =>
  codeService
    .getCode({ retailId: params.id, number: params.code })
    .then(code => {
      const result = changeCode(code);
      res.status(200);
      res.send(result);
      res.end();
    })
    .catch(next);
exports.createCodeApp = (req, res, next) => {
  const code = {
    offerId: req.params.id,
    email: req.user.email
  };
  return Offer.getBy({ id: code.offerId, email: code.email })
    .then(off => {
      if (off) {
        const status = getOfferStatus(off.dataValues);
        if (OFFER_ACTIVE === status) {
          code.code = uuid().slice(0, offerCodeLength);
          return uniqueCode.verify(code).then(newCode => {
            res.status(201);
            res.send({
              product: off.dataValues.product,
              valueStrategy: off.dataValues.valueStrategy,
              expires: off.dataValues.expiration,
              code: newCode.dataValues.code
            });
            res.end();
          });
        } else {
          throw {
            [OFFER_OUT_OF_STOCK]: errors.offerOutOfStock,
            [OFFER_FINISHED]: errors.offerExpire,
            [OFFER_DISABLED]: errors.offerDisabled
          }[status];
        }
      } else {
        throw errors.offerNotFound;
      }
    })
    .catch(next);
};
