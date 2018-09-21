const EmailUser = require('../models').email_user,
  serviceEmailUser = require('../services/emailUser'),
  serviceOffer = require('../services/offer'),
  Code = require('../models').code;

exports.getAll = (req, res, next) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10,
    offset = req.query.page ? req.query.page * limit : 0,
    category = req.query.category ? parseInt(req.query.category) : null,
    name = req.query.name ? req.query.name : '';
  return serviceOffer
    .getAllApp({ offset, limit, email: req.email, category, name })
    .then(offers =>
      Promise.all(serviceOffer.getDataFromOffers(offers)).then(offersWithDataRetail => {
        res.status(200);
        res.send({ count: offersWithDataRetail.length, offers: offersWithDataRetail });
        res.end();
      })
    )
    .catch(next);
};
exports.getCodes = (req, res, next) => {
  const limitQuery = req.query.limit ? parseInt(req.query.limit) : 10;
  const offsetQuery = req.query.page ? req.query.page * limitQuery : 0;
  return Code.getAllBy({ offset: offsetQuery, email: req.email, limit: limitQuery })
    .then(codes => {
      const offersWithCodes = serviceEmailUser.getDataFromCodes(codes.rows);
      res.status(200);
      res.send({ pages: Math.ceil(codes.count / limitQuery), count: codes.count, codes: offersWithCodes });
      res.end();
    })
    .catch(next);
};
