const codeService = require('../services/code'),
  utils = require('../utils'),
  serviceS3 = require('../services/s3'),
  errors = require('../errors'),
  Offer = require('../models').offer,
  uniqueCode = require('../services/uniqueCode'),
  emailService = require('../services/mailer'),
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
          return serviceS3.obtainUrl(off.dataValues.id, off.imgExtension).then(urlOffer => {
            return Offer.incrementField('codes', { id: newCode.offerId }).then(() => {
              off.dataValues.urlImg = urlOffer;
              return emailService.sendNewCode(off.dataValues, newCode.dataValues).then(() => {
                res.status(200);
                res.send({ code: newCode });
                res.end();
              });
            });
          });
        });
      } else {
        return emailService.sendEmail('offerInvalid', off.dataValues, code.dataValues).then(() => {
          throw errors.offerInactive;
        });
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
        product: code.offer.product
      };
      serviceS3.obtainUrl(code.offer.id, code.offer.imgExtension).then(url => {
        result.image = url;
        res.status(200);
        res.send(result);
        res.end();
      });
    })
    .catch(next);
