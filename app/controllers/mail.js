const Category = require('../models').category,
  ses = require('../services/ses');

exports.sendTestMail = ({ body }, res, next) =>
  ses
    .sendMail(body.mail, body.to)
    .then(() => res.status(200).end())
    .catch(next);
