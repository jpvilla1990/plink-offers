const factory = require('./factoryManager').factory,
  userOffer = require('../../app/models').user_offer;

exports.nameFactory = 'userOffer';

factory.define(exports.nameFactory, userOffer, {
  email: factory.chance('email'),
  hashEmail: factory.seq('userOffer.hashEmail', n => `hash${n}`),
  offerId: factory.assoc('Offer', 'id')
});
