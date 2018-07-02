const Offer = require('../models').offer,
  logger = require('../logger'),
  serviceS3 = require('../services/s3'),
  config = require('../../config'),
  emailService = require('../services/mailer'),
  utils = require('../utils');

exports.getImageUrl = (req, res, next) =>
  serviceS3
    .getSignedUrlPut()
    .then(url => {
      res.send({ url });
    })
    .catch(next);

exports.create = (req, res, next) => {
  const offer = {
    product: req.body.product,
    begin: req.body.begin,
    expiration: req.body.expiration,
    categoryId: req.body.category,
    strategy: req.body.strategy,
    maxRedemptions: req.body.maxRedemptions,
    purpose: req.body.purpose,
    valueStrategy: req.body.valueStrategy,
    imageUrl: req.body.url
  };
  offer.retail = req.retail;
  return Offer.createModel(offer)
    .then(off => {
      return Offer.getBy({ id: off.dataValues.id }).then(newOff => {
        offer.nameCategory = newOff.category.dataValues.name;
        return emailService.sendNewOffer(offer, config.common.server.email_new_offer).then(() => {
          res.status(201).end();
        });
      });
    })
    .catch(err => next(err));
};
exports.getAll = (req, res, next) => {
  const limitQuery = req.query.limit ? parseInt(req.query.limit) : 10;
  const offsetQuery = req.query.page === 0 ? 0 : req.query.page * limitQuery;
  return Offer.getAllBy({ retail: req.params.id, offset: offsetQuery, limit: limitQuery })
    .then(list => {
      const listResult = list.rows.map(value => ({
        product: value.dataValues.product,
        begin: value.dataValues.begin,
        expires: value.dataValues.expiration,
        maxRedemptions: value.dataValues.maxRedemptions,
        image: value.dataValues.imageUrl,
        codes: value.dataValues.codes ? value.dataValues.codes : 0,
        redemptions: value.dataValues.redemptions ? value.dataValues.redemptions : 0,
        status: utils.getOfferStatusString(value.dataValues)
      }));
      res.status(200);
      res.send({ count: list.count, offers: listResult });
      res.end();
    })
    .catch(err => next(err));
};
