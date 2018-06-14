const Code = require('../models').code,
  Offer = require('../models').offer,
  utils = require('../utils'),
  moment = require('moment'),
  errors = require('../errors'),
  uniqueCode = require('../services/uniqueCode'),
  uuid = require('uuid');

exports.create = (req, res, next) => {
  const code = {
    email: req.body.email,
    offer: parseInt(req.params.id),
    dateRedemption: moment().format('YYYY-MM-DD')
  };
  return Offer.getBy()
    .then(off => {
      const active = utils.getStatus({
        expires: off.expiration,
        begin: off.begin,
        redemptions: off.redemptions,
        maxRedemptions: off.maxRedemptions
      });
      if (active) {
        code.code = uuid().slice(0, 8);
        return uniqueCode.verify(code).then(newCode => {
          return Offer.incrementField('codes', { id: newCode.offer }).then(() => {
            res.status(200);
            res.send({ code: newCode });
            res.end();
          });
        });
      } else {
        next(errors.badRequest('The offer expired'));
      }
    })
    .catch(next);
};
