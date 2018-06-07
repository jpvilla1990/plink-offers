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
