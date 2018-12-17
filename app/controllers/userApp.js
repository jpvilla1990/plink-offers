const { getPosIdsByDocumentNumber } = require('../services/posId'),
  serviceUserOffer = require('../services/userApp'),
  serviceOffer = require('../services/offer'),
  serviceCognito = require('../services/cognito'),
  errors = require('../errors'),
  Code = require('../models').code;

exports.getAll = (req, res, next) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10,
    offset = req.query.page ? req.query.page * limit : 0,
    category = req.query.category ? parseInt(req.query.category) : null,
    documentNumber = req.user['custom:document_number'],
    name = req.query.name ? req.query.name : '';
  return getPosIdsByDocumentNumber(documentNumber)
    .then(posIds =>
      serviceOffer
        .getAllApp({ offset, limit, email: req.user.email, category, name, posIds })
        .then(userOffers =>
          Promise.all(serviceOffer.getDataFromOffers(userOffers.rows)).then(offersWithDataRetail => {
            res.status(200);
            res.send({
              pages: Math.ceil(userOffers.count / limit),
              count: userOffers.count,
              offers: offersWithDataRetail
            });
            res.end();
          })
        )
    )
    .catch(next);
};
exports.getOffer = (req, res, next) =>
  serviceOffer
    .getByApp({ id: req.params.id, email: req.user.email })
    .then(offer => {
      if (offer) {
        return Promise.all(serviceOffer.getDataFromOffers([offer])).then(offerWithDataFromRetail =>
          res
            .status(200)
            .send(offerWithDataFromRetail[0])
            .end()
        );
      } else {
        throw errors.offerNotFound;
      }
    })
    .catch(next);

exports.getCodes = (req, res, next) => {
  const limitQuery = req.query.limit ? parseInt(req.query.limit) : 10;
  const offsetQuery = req.query.page ? req.query.page * limitQuery : 0;
  return Code.getAllBy({ offset: offsetQuery, email: req.user.email, limit: limitQuery })
    .then(codes => {
      const offersWithCodes = serviceUserOffer.getDataFromCodes(codes.rows);
      res.status(200);
      res.send({ pages: Math.ceil(codes.count / limitQuery), count: codes.count, codes: offersWithCodes });
      res.end();
    })
    .catch(next);
};
exports.checkAvailable = (req, res, next) =>
  serviceCognito
    .checkEmail(req.body.email)
    .then(result =>
      res
        .status(200)
        .send(result)
        .end()
    )
    .catch(next);
