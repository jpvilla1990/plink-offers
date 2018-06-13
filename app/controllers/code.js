const Code = require('../models').code,
  Offer = require('../models').offer,
  utils = require('../utils'),
  moment = require('moment'),
  uniqueCode = require('../services/uniqueCode'),
  uuid = require('uuid');

exports.create = (req, res, next) => {
  const code = {
    email: req.body.email,
    offer: parseInt(req.params.id),
    dateRedemption: moment().format('YYYY-MM-DD')
  };
  code.code = '2730b425';
  //   code.code = uuid().slice(0,8);
  return uniqueCode
    .verify(code)
    .then(newCode => {
      res.status(200);
      res.send({ code: newCode });
      res.end();
    })
    .catch(next);
};
