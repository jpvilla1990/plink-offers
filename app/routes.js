const Offer = require('./controllers/offer'),
  Code = require('./controllers/code'),
  category = require('./controllers/category'),
  target = require('./controllers/target'),
  termsAndConditions = require('./controllers/termsAndConditions'),
  offerService = require('./services/offer'),
  typeOffer = require('./controllers/typeOffer'),
  userOffer = require('./controllers/userApp'),
  code = require('./controllers/code'),
  { sendOfferDisabledByPlink } = require('./services/mailer'),
  auth = require('./middlewares/auth'),
  user = require('./controllers/user'),
  validator = require('./middlewares/validator');

exports.init = app => {
  app.post('/retail/:id/offers', [auth.requireRetail, validator.checkAll, validator.validate], Offer.create);
  app.get('/image-offer', Offer.getImageUrl);
  app.get('/retail/:id/offers', [auth.requireRetail], Offer.getAll);
  app.get('/categories', category.getAllCategoriesDashboard);
  app.get('/type-offers', typeOffer.getAllTypes);
  app.get('/ranges', target.getAgeRanges);
  app.get('/genders', target.getAllGenders);
  app.patch('/retail/:id/code/:code/redeem', [auth.requireRetail], code.redeemCode);
  app.get('/retail/:id/code/:code', [auth.requireRetail], code.getCode);
  app.get('/retail/:id/offers/:id_offer', [auth.requireRetail], Offer.getOffer());
  app.post('/access-offer', Offer.accessOffer);
  app.get(
    '/retail/:id/offers/:id_offer/redemptions',
    [auth.requireRetail, validator.checkQuery, validator.validate],
    Offer.getRedemptions
  );
  app.post('/offer-app/offers/:id/code', [auth.requireEmail], code.createCodeApp);
  app.get('/back/offers', Offer.getOffersBack);
  app.patch('/back/offers/:id_offer', Offer.disableOffer(sendOfferDisabledByPlink));
  app.get('/back/offers/:id_offer', Offer.getOffer(offerService.getDataFromRetail));
  app.patch('/retail/:id/offers/:id_offer', [auth.requireRetail], Offer.disableOffer());
  app.get('/offer-app/categories', category.getAllCategoriesApp);
  app.get('/offer-app/offers', [auth.requireEmail], userOffer.getAll);
  app.get('/offer-app/codes', [auth.requireEmail], userOffer.getCodes);
  app.get('/offer-app/offers/:id', [auth.requireEmail], userOffer.getOffer);
  app.put('/offer-app/login', [auth.requireEmail], user.updateFirstLogin);
  app.post('/offers-public/users', [validator.checkEmail, validator.validate], userOffer.checkAvailable);
  app.get('/offers-public/terms-and-conditions', termsAndConditions.get);
};
