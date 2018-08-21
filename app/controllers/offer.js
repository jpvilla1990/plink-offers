const Offer = require('../models').offer,
  Category = require('../models').category,
  errors = require('../errors'),
  codeService = require('../services/code'),
  offerService = require('../services/offer'),
  { sendNewOffer } = require('../services/mailer'),
  serviceS3 = require('../services/s3'),
  config = require('../../config'),
  requestService = require('../services/request'),
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
  return requestService
    .getPoints(offer.retail)
    .then(dataCommerce => {
      offer.nit = dataCommerce.commerce.nit;
      return Offer.create(offer).then(newOff => {
        return Category.getBy({ id: offer.categoryId }).then(category => {
          return sendNewOffer({
            offer: newOff.dataValues,
            mail: config.common.server.email_new_offer,
            dataCommerce,
            nameCategory: category.dataValues.name
          }).then(() => {
            res.status(201);
            res.end();
          });
        });
      });
    })
    .catch(err => next(err));
};
exports.getOffer = (req, res, next) => {
  const idOffer = req.params.id_offer;
  return Offer.getBy({ id: idOffer })
    .then(off => {
      if (off) {
        const send = utils.map(off);
        res.status(200);
        res.send(send);
        res.end();
      } else {
        throw errors.offerNotFound;
      }
    })
    .catch(next);
};
exports.getAll = (req, res, next) => {
  const limitQuery = req.query.limit ? parseInt(req.query.limit) : 10;
  const offsetQuery = req.query.page ? req.query.page * limitQuery : 0;
  return Offer.getAllDashboardBy({ retail: req.params.id, offset: offsetQuery, limit: limitQuery })
    .then(list => {
      const listResult = list.rows.map(value => ({
        id: value.dataValues.id,
        product: value.dataValues.product,
        begin: value.dataValues.begin,
        expires: value.dataValues.expiration,
        maxRedemptions: value.dataValues.maxRedemptions,
        image: value.dataValues.imageUrl,
        codes: value.dataValues.codes ? value.dataValues.codes : 0,
        redemptions: value.dataValues.redemptions ? value.dataValues.redemptions : 0,
        status: utils.getOfferStatus(value.dataValues)
      }));
      res.status(200);
      res.send({ count: list.count, offers: listResult });
      res.end();
    })
    .catch(err => next(err));
};
exports.accessOffer = (req, res, next) => {
  if (req.body.code && req.body.code === config.common.access_offer) {
    res.status(200);
    res.end();
  } else {
    next(errors.userUnauthorized);
  }
};
exports.getRedemptions = (req, res, next) => {
  const limitQuery = req.query.limit ? parseInt(req.query.limit) : 10,
    offsetQuery = req.query.page ? req.query.page * limitQuery : 0,
    idOffer = req.params.id_offer;
  return codeService
    .getRedemptions({ id: idOffer, offset: offsetQuery, limit: limitQuery })
    .then(list => {
      const listRedemptions = list.rows.map(value => ({
          code: value.code,
          createdAt: utils.moment(value.created_at).format('YYYY-MM-DD'),
          dateRedemption: utils.moment(value.dateRedemption).format('YYYY-MM-DD'),
          hourRedemption: utils.moment(value.dateRedemption).format('HH:mm'),
          mail: utils.mask(value.email)
        })),
        pages = Math.ceil(list.count / limitQuery);
      res.status(200);
      res.send({ pages, redemptions: listRedemptions });
      res.end();
    })
    .catch(err => next(err));
};

exports.getOffersBack = (req, res, next) => {
  const limitQuery = req.query.limit ? parseInt(req.query.limit) : 10,
    offsetQuery = req.query.page ? req.query.page * limitQuery : 0;
  return offerService
    .getAllBack({ limit: limitQuery, offset: offsetQuery, filter: req.query.filter })
    .then(resultQuery => {
      const offers = utils.getDataForBack(resultQuery.rows),
        count = resultQuery.count,
        pages = Math.ceil(resultQuery.count / limitQuery);
      res.status(200);
      res.send({ count, pages, offers });
      res.end();
    })
    .catch(err => next(err));
};
exports.changeActive = (req, res, next) =>
  Offer.getBy({ id: parseInt(req.params.id_offer) })
    .then(offer => {
      if (offer) {
        return offer.update({ active: !offer.dataValues.active }).then(() => {
          res.status(200).end();
        });
      } else {
        throw errors.offerNotFound;
      }
    })
    .catch(next);
