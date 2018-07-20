const Offer = require('./controllers/offer'),
  Code = require('./controllers/code'),
  category = require('./controllers/category'),
  typeOffer = require('./controllers/typeOffer'),
  EmailUser = require('./controllers/emailUser'),
  code = require('./controllers/code'),
  mail = require('./controllers/mail'),
  auth = require('./middlewares/auth'),
  validator = require('./middlewares/validator');

exports.init = app => {
  app.post('/retail/:id/offers', [auth.requireRetail, validator.checkAll, validator.validate], Offer.create);
  app.get('/image-offer', Offer.getImageUrl);
  app.get('/retail/:id/offers', [auth.requireRetail, validator.checkQuery, validator.validate], Offer.getAll);
  app.post('/offers/:id/code', [validator.checkEmail, validator.validate], Code.create);
  app.get('/categories', category.getAllCategories);
  app.get('/type-offers', typeOffer.getAllTypes);
  app.patch('/retail/:id/code/:code/redeem', [auth.requireRetail], code.redeemCode);
  app.get('/retail/:id/code/:code', [auth.requireRetail], code.getCode);
  app.get('/retail/:id/offers/:id_offer', [auth.requireRetail], Offer.getOffer);
  app.post('/test-mail', mail.sendTestMail);
  app.post('/access-offer', [], Offer.accessOffer);
  app.get(
    '/offer-app/offers',
    [auth.requireEmail, validator.checkQuery, validator.validate],
    EmailUser.getAll
  );
  app.get(
    '/offer-app/codes',
    [auth.requireEmail, validator.checkQuery, validator.validate],
    EmailUser.getCodes
  );
  app.get(
    '/retail/:id/offers/:id_offer/redemptions',
    [auth.requireRetail, validator.checkQuery, validator.validate],
    Offer.getRedemptions
  );
};
