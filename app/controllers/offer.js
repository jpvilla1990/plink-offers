const Offer = require('../models').offer,
  serviceS3 = require('../services/s3'),
  utils = require('../utils');

exports.getImageUrl = (req, res, next) =>
  serviceS3
    .getSignedUrlPut()
    .then(url => {
      res.send({ url });
    })
    .catch(next);

exports.create = (req, res, next) => {
  const off = {
    product: req.body.product,
    begin: req.body.begin,
    expiration: req.body.expiration,
    category: req.body.category,
    strategy: req.body.strategy,
    maxRedemptions: req.body.maxRedemptions,
    purpose: req.body.purpose,
    valueStrategy: req.body.valueStrategy,
    imageUrl: req.body.url
  };
  off.retail = req.retail;
  return Offer.createModel(off)
    .then(() => {
      res.status(201).end();
    })
    .catch(err => next(err));
};
exports.getOffer = (req, res, next) => {
  const idOffer = req.params.id;
  return Offer.getBy({ id: idOffer })
    .then(off => {
      const send = {
        image: off.dataValues.imageUrl,
        product: off.dataValues.product,
        begin: off.dataValues.begin,
        expires: off.dataValues.expiration,
        maxRedemptions: off.dataValues.maxRedemptions,
        redemptions: off.dataValues.redemptions,
        status: utils.getOfferStatusString(off.dataValues),
        category: off.category.name,
        typeOffer: off.type.description,
        valueStrategy: off.dataValues.valueStrategy
      };
      res.status(200);
      res.send(send);
      res.end();
    })
    .catch(next);
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
