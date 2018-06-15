const Code = require('../models').code,
  Offer = require('../models').offer,
  utils = require('../utils'),
  moment = require('moment'),
  logger = require('../logger'),
  errors = require('../errors'),
  uniqueCode = require('../services/uniqueCode'),
  uuid = require('uuid'),
  codeService = require('../services/code');

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
