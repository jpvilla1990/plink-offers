const factory = require('./factoryManager').factory,
  moment = require('moment'),
  Offer = require('../../app/models').offer;

exports.nameFactory = 'Offer';

factory.define(exports.nameFactory, Offer, {
  product: factory.seq('Offer.product', n => `product${n}`),
  begin: moment(),
  expiration: moment().add(10, 'days'),
  strategy: factory.assoc('TypeOffer', 'id'),
  maxRedemptions: 50,
  retail: 11,
  purpose: 'Vacations',
  imgExtension: '.jpg',
  valueStrategy: '30%',
  category: factory.assoc('Category', 'id')
});
