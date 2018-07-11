const Offer = require('./controllers/offer'),
  Code = require('./controllers/code'),
  category = require('./controllers/category'),
  typeOffer = require('./controllers/typeOffer'),
  code = require('./controllers/code'),
  mail = require('./controllers/mail'),
  auth = require('./middlewares/auth'),
  validator = require('./middlewares/validator');

exports.init = app => {
  app.post('/retail/:id/offers', [auth.requireToken, validator.checkAll, validator.validate], Offer.create);
  app.get('/image-offer', Offer.getImageUrl);
  app.get('/retail/:id/offers', [auth.requireToken, validator.checkQuery, validator.validate], Offer.getAll);
  app.post('/offers/:id/code', [], Code.create);
  app.get('/categories', category.getAllCategories);
  app.get('/type-offers', typeOffer.getAllTypes);
  app.patch('/retail/:id/code/:code/redeem', [auth.requireToken], code.redeemCode);
  app.get('/retail/:id/code/:code', [auth.requireToken], code.getCode);
  app.post('/test-mail', mail.sendTestMail);
  app.get('/points/:id', [], Offer.info);
  app.post('/access-offer', [], Offer.accessOffer);
  app.get(
    '/retail/:id/offers/:id_offer/redemptions',
    [auth.requireToken, validator.checkQuery, validator.validate],
    Offer.getRedemptions
  );
};
