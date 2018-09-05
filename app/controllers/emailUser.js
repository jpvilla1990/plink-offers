const EmailUser = require('../models').email_user,
  serviceEmailUser = require('../services/emailUser'),
  Code = require('../models').code;

exports.getAll = (req, res, next) => {
  const limitQuery = req.query.limit ? parseInt(req.query.limit) : 10,
    offsetQuery = req.query.page ? req.query.page * limitQuery : 0,
    category = req.query.category ? parseInt(req.query.category) : null;
  return EmailUser.getAll({ offset: offsetQuery, email: req.email, limit: limitQuery, category })
    .then(offersByUser => {
      const offers = new Array();
      return Promise.all(serviceEmailUser.getDataFromOffers(offersByUser))
        .then(off => {
          off.forEach(data => {
            offers.push(data);
          });
        })
        .then(() => {
          res.status(200);
          res.send({ count: offers.length, offers });
          res.end();
        });
    })
    .catch(next);
};
exports.getCodes = (req, res, next) => {
  const limitQuery = req.query.limit ? parseInt(req.query.limit) : 10;
  const offsetQuery = req.query.page ? req.query.page * limitQuery : 0;
  return Code.getAllBy({ offset: offsetQuery, email: req.email, limit: limitQuery })
    .then(codes => {
      const offersWithCodes = serviceEmailUser.getDataFromCodes(codes.rows);
      res.status(200);
      res.send({ count: offersWithCodes.length, codes: offersWithCodes });
      res.end();
    })
    .catch(next);
};
