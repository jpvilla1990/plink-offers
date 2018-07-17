const EmailUser = require('../models').email_user,
  serviceEmailUser = require('../services/emailUser');

exports.getAll = (req, res, next) => {
  const limitQuery = req.query.limit ? parseInt(req.query.limit) : 10;
  const offsetQuery = req.query.page === 0 ? 0 : req.query.page * limitQuery;
  return EmailUser.getAll({ offset: offsetQuery, limit: limitQuery })
    .then(list => {
      const listResult = serviceEmailUser.map(list);
      res.status(200);
      res.send({ count: list.count, offers: listResult });
      res.end();
    })
    .catch(err => next(err));
};
