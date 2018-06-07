const Offer = require('../models').offer,
  logger = require('../logger'),
  serviceS3 = require('../services/s3');

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
      return serviceS3.getUrl(rv.id, off.imgExtension).then(result => {
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
      res.status(200);
      res.send({ count: list.count, offers: list.rows });
      res.end();
    })
    .catch(err => next(err));
};
