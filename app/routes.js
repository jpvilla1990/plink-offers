const Offer = require('./controllers/offer'),
  auth = require('./middlewares/auth'),
  validator = require('./middlewares/validator');

exports.init = app => {
  app.post('/retail/:id/offers', [auth.requireToken, validator.checkAll, validator.validate], Offer.create);
  app.get(
    '/retail/:id/offers',
    [auth.requireToken, validator.checkQuery, validator.validateQuery],
    Offer.getAll
  );
};
