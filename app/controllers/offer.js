const Offer = require('../models').offer,
  logger = require('../logger'),
  serviceS3 = require('../services/s3'),
  moment = require('moment');

const getStatus = (begin, expiration, redemptions, maxRedemptions) => {
  const diffNowWithBegin = moment(begin).diff(moment(), 'days'),
    diffNowWithExpiration = moment(expiration).diff(moment(), 'days');
  return diffNowWithExpiration >= 0 && diffNowWithBegin < 0 && redemptions < maxRedemptions;
};
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
  off.redemptions = off.maxRedemptions;
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
        const beginMoment = moment(value.dataValues.begin)
            .utc()
            .format('YYYY-MM-DD'),
          expirationMoment = moment(value.dataValues.expiration)
            .utc()
            .format('YYYY-MM-DD'),
          offerWithUrl = {
            product: value.dataValues.product,
            begin: beginMoment,
            expires: expirationMoment
          };
        offerWithUrl.codes = value.dataValues.codes ? value.dataValues.codes : 0;
        offerWithUrl.maxRedemptions = value.dataValues.maxRedemptions;
        offerWithUrl.redemptions = value.dataValues.redemptions ? value.dataValues.redemptions : 0;
        offerWithUrl.status = getStatus(
          beginMoment,
          expirationMoment,
          offerWithUrl.redemptions,
          value.dataValues.maxRedemptions
        )
          ? 'active'
          : 'inactive';
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
