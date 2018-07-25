const codeService = require('../services/code'),
  utils = require('../utils'),
  errors = require('../errors'),
  Offer = require('../models').offer,
  uniqueCode = require('../services/uniqueCode'),
  UserEmail = require('../models').email_user,
  emailService = require('../services/mailer'),
  uuid = require('uuid');

const changeCode = code => {
  const result = {
    email: utils.mask(code.email),
    code: code.code,
    dateRedemption: code.dateRedemption
      ? utils.moment(code.dateRedemption).format('YYYY-MM-DD HH:mm:ss')
      : null,
    status: utils.getOfferStatusString(code.offer.dataValues),
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
        const active = utils.getOfferStatus(off.dataValues);
        if (active) {
          return UserEmail.getBy({ email: code.email, offer_id: code.offerId }).then(userEmail => {
            if (userEmail) {
              code.code = uuid().slice(0, 8);
              return uniqueCode.verify(code).then(newCode =>
                emailService.sendNewCode(off.dataValues, newCode.dataValues).then(() => {
                  res.status(201);
                  res.end();
                })
              );
            } else {
              throw errors.userNotFound;
            }
          });
        } else {
          return emailService.sendOfferExpired(off.dataValues, code).then(() => {
            throw errors.offerInactive;
          });
        }
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
        throw errors.offerNotFound;
      }
    })
    .catch(next);
};
