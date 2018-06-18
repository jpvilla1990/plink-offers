const Offer = require('../models').offer,
  serviceS3 = require('../services/s3'),
  utils = require('../utils');

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
    imgExtension: req.body.extension
  };
  off.retail = req.retail;
  return Offer.createModel(off)
    .then(rv => {
      return serviceS3.obtainUrl(rv.id, off.imgExtension).then(result => {
        res.status(200);
        res.send({ urlBucket: result });
        res.end();
      });
    })
    .catch(err => next(err));
};
exports.getAll = (req, res, next) => {
  const limitQuery = req.query.limit ? parseInt(req.query.limit) : 10;
  const offsetQuery = req.query.page === 0 ? 0 : req.query.page * limitQuery;
  return Offer.getAllBy({ retail: req.params.id, offset: offsetQuery, limit: limitQuery })
    .then(list => {
      const listPromise = list.rows.map(value => {
        const offerWithUrl = {
          product: value.dataValues.product,
          begin: value.dataValues.begin,
          expires: value.dataValues.expiration,
          maxRedemptions: value.dataValues.maxRedemptions,
          codes: value.dataValues.codes,
          redemptions: value.dataValues.redemptions
        };
        offerWithUrl.codes = value.dataValues.codes ? value.dataValues.codes : 0;
        offerWithUrl.redemptions = value.dataValues.redemptions ? value.dataValues.redemptions : 0;
        offerWithUrl.status = utils.getOfferStatusString(value.dataValues);
        return serviceS3.getUrl(value.dataValues.id, value.dataValues.imgExtension).then(url => {
          offerWithUrl.image = url;
          return offerWithUrl;
        });
      });
      return Promise.all(listPromise).then(offs => {
        res.status(200);
        res.send({ count: list.count, offers: offs });
        res.end();
      });
    })
    .catch(err => next(err));
};
