const Offer = require('./controllers/offer'),
  Code = require('./controllers/code'),
  category = require('./controllers/category'),
  typeOffer = require('./controllers/typeOffer'),
  auth = require('./middlewares/auth'),
  validator = require('./middlewares/validator');

exports.init = app => {
  app.post('/retail/:id/offers', [auth.requireToken, validator.checkAll, validator.validate], Offer.create);
  app.get('/retail/:id/offers', [auth.requireToken, validator.checkQuery, validator.validate], Offer.getAll);
  app.post('/retail/:id/offers', [auth.requireToken, validator.checkAll, validator.validate], Offer.create);
  app.post('/offers/:id/code', [validator.checkEmail, validator.validate], Code.create);
  app.get('/categories', category.getAllCategories);
  app.get('/type-offers', typeOffer.getAllTypes);
};
