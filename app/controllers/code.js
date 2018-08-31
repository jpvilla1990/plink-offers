const codeService = require('../services/code'),
  utils = require('../utils'),
  errors = require('../errors'),
  Offer = require('../models').offer,
  uniqueCode = require('../services/uniqueCode'),
  { sendNewCode, sendOfferExpired } = require('../services/mailer'),
  UserEmail = require('../models').email_user,
  { OFFER_DISABLED, OFFER_INACTIVE, OFFER_ACTIVE, OFFER_FINISHED } = require('../constants'),
  requestService = require('../services/request'),
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

exports.create = (req, res, next) => {
  const code = {
    email: req.body.email,
    offerId: parseInt(req.params.id)
  };
  return Offer.getBy({ id: code.offerId })
    .then(off => {
      if (off) {
        const status = getOfferStatus(off.dataValues);
        return UserEmail.getBy({ email: code.email, offer_id: code.offerId }).then(userEmail => {
          if (userEmail) {
            return requestService
              .getPoints(off.dataValues.retail)
              .then(dataCommerce => {
                if (status === OFFER_ACTIVE) {
                  code.code = uuid().slice(0, 8);
                  return uniqueCode.verify(code).then(newCode =>
                    sendNewCode({
                      offer: off.dataValues,
                      code: newCode.dataValues,
                      dataCommerce,
                      nameCategory: off.category.dataValues.name
                    }).then(() => {
                      res.status(201);
                      res.end();
                    })
                  );
                } else {
                  return sendOfferExpired({
                    offer: off.dataValues,
                    code,
                    dataCommerce,
                    nameCategory: off.category.dataValues.name
                  }).then(() => {
                    throw {
                      [OFFER_INACTIVE]: errors.offerInactive,
                      [OFFER_FINISHED]: errors.offerExpire,
                      [OFFER_DISABLED]: errors.offerDisabled
                    }[status];
                  });
                }
              })
              .catch(err => next(err));
          } else {
            throw errors.userNotFound;
          }
        });
      } else {
        throw errors.offerNotFound;
      }
    })
    .catch(next);
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
    email: req.email
  };
  return Offer.getBy({ id: code.offerId })
    .then(off => {
      if (off) {
        if (OFFER_ACTIVE === getOfferStatus(off.dataValues)) {
          code.code = uuid().slice(0, 8);
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
          throw errors.offerInactive;
        }
      } else {
        throw errors.offerNotFound;
      }
    })
    .catch(next);
};
