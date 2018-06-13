const Offer = require('./controllers/offer'),
  category = require('./controllers/category'),
  typeOffer = require('./controllers/typeOffer'),
  auth = require('./middlewares/auth'),
  validator = require('./middlewares/validator');

exports.init = app => {
  app.post('/retail/:id/offers', [auth.requireToken, validator.checkAll, validator.validate], Offer.create);
  app.get(
    '/retail/:id/offers',
    [auth.requireToken, validator.checkQuery, validator.validateQuery],
    Offer.getAll
  );
  app.post('/retail/:id/offers', [auth.requireToken, validator.checkAll, validator.validate], Offer.create);
  app.get('/categories', category.getAllCategories);
  app.get('/type-offers', typeOffer.getAllTypes);
};
