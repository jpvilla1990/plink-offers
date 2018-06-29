const codeService = require('../services/code'),
  utils = require('../utils'),
  errors = require('../errors'),
  config = require('../../config'),
  Offer = require('../models').offer,
  uniqueCode = require('../services/uniqueCode'),
  emailService = require('../services/mailer'),
  uuid = require('uuid');

const changeCode = code => {
  const result = {
    email: code.email,
    code: code.code,
    dateRedemption: code.dateRedemption
      ? utils.moment(code.dateRedemption).format('YYYY-MM-DD HH:MM:ss')
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
      const active = utils.getOfferStatus(off.dataValues);
      if (active) {
        code.code = uuid().slice(0, 8);
        return uniqueCode.verify(code).then(newCode => {
          return Offer.incrementField('codes', { id: newCode.offerId }).then(() => {
            return emailService.sendNewCode(off.dataValues, newCode.dataValues).then(() => {
              // res.status(200);
              // res.send({ code: newCode });
              res.writeHead(301, {
                Location: config.common.server.url_land
              });
              res.end();
            });
          });
        });
      } else {
        return emailService.sendOfferExpired(off.dataValues, code).then(() => {
          // throw errors.offerInactive;
          res.writeHead(301, {
            Location: config.common.server.url_land
          });
          res.end();
        });
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
