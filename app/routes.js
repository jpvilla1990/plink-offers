const Offer = require('./controllers/offer'),
  category = require('./controllers/category'),
  typeOffer = require('./controllers/typeOffer'),
  auth = require('./middlewares/auth'),
  { checkAll, validate } = require('./middlewares/validator');

exports.init = app => {
  app.post('/retail/:id/offers', [auth.requireToken, checkAll, validate], Offer.create);
  app.get('/categories', category.getAllCategories);
  app.get('/type-offers', typeOffer.getAllTypes);
};
