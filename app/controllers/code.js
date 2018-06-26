const codeService = require('../services/code'),
  utils = require('../utils'),
  serviceS3 = require('../services/s3'),
  errors = require('../errors'),
  Offer = require('../models').offer,
  uniqueCode = require('../services/uniqueCode'),
  uuid = require('uuid');

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
            res.status(200);
            res.send({ code: newCode });
            res.end();
          });
        });
      } else {
        throw errors.offerInactive;
      }
    })
    .catch(next);
};
exports.redeemCode = ({ params }, res, next) =>
  codeService
    .redeemCode({ retailId: params.id, code: params.code })
    .then(() => res.status(200).end())
    .catch(next);

exports.getCode = ({ params }, res, next) =>
  codeService
    .getCode({ retailId: params.id, number: params.code })
    .then(code => {
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
      res.status(200);
      res.send(result);
      res.end();
    })
    .catch(next);
