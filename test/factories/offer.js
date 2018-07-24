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
  imageUrl: factory.seq(
    'Offer.image',
    n => `'https://s3.amazonaws.com/plink-email-assets/plink_offers/${n}.jpg`
  ),
  valueStrategy: '30%',
  categoryId: factory.assoc('Category', 'id')
});
