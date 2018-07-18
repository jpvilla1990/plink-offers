const EmailUser = require('../models').email_user,
  serviceEmailUser = require('../services/emailUser');

exports.getAll = (req, res, next) => {
  const limitQuery = req.query.limit ? parseInt(req.query.limit) : 10;
  const offsetQuery = req.query.page === 0 ? 0 : req.query.page * limitQuery;
  return EmailUser.getAll({ offset: offsetQuery, email: req.email, limit: limitQuery })
    .then(list => {
      const listPromise = serviceEmailUser.map(list),
        listResult = new Array();
      Promise.all(listPromise)
        .then(offers => {
          offers.forEach(value => {
            listResult.push(value);
          });
        })
        .then(() => {
          res.status(200);
          res.send({ count: listResult.length, offers: listResult });
          res.end();
        });
    })
    .catch(err => next(err));
};
