const Offer = require('./controllers/offer'),
  auth = require('./middlewares/auth'),
  { checkAll, validate } = require('./middlewares/validator');

exports.init = app => {
  app.post('/retail/:id/offers', [auth.requireToken, checkAll, validate], Offer.create);
};
