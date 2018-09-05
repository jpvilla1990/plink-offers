const factory = require('./factoryManager').factory,
  moment = require('moment'),
  Offer = require('../../app/models').offer;

exports.nameFactory = 'Offer';

factory.define(exports.nameFactory, Offer, {
  product: factory.seq('Offer.product', n => `product${n}`),
  begin: moment().subtract(1, 'days'),
  expiration: moment().add(10, 'days'),
  strategy: factory.assoc('TypeOffer', 'id'),
  maxRedemptions: 50,
  redemptions: 0,
  retail: 11,
  purpose: 'Vacations',
  imageUrl: factory.seq(
    'Offer.image',
    n => `'https://s3.amazonaws.com/plink-email-assets/plink_offers/${n}.jpg`
  ),
  valueStrategy: '10%',
  categoryId: factory.assoc('Category', 'id'),
  nit: 12345,
  active: true
});

factory.define('ActiveOffer', Offer, {
  product: factory.seq('Offer.product', n => `product${n}`),
  begin: moment().subtract(1, 'days'),
  expiration: moment().add(10, 'days'),
  strategy: factory.assoc('TypeOffer', 'id'),
  maxRedemptions: 50,
  redemptions: 0,
  retail: 1222,
  purpose: 'Vacations',
  imageUrl: factory.seq(
    'Offer.image',
    n => `'https://s3.amazonaws.com/plink-email-assets/plink_offers/${n}.jpg`
  ),
  valueStrategy: '10%',
  categoryId: factory.assoc('Category', 'id'),
  nit: 12345,
  active: true
});

factory.define('DisabledOffer', Offer, {
  product: factory.seq('Offer.product', n => `product${n}`),
  begin: moment().subtract(1, 'days'),
  expiration: moment().add(10, 'days'),
  strategy: factory.assoc('TypeOffer', 'id'),
  maxRedemptions: 50,
  redemptions: 0,
  retail: 1222,
  purpose: 'Vacations',
  imageUrl: factory.seq(
    'Offer.image',
    n => `'https://s3.amazonaws.com/plink-email-assets/plink_offers/${n}.jpg`
  ),
  valueStrategy: '10%',
  categoryId: factory.assoc('Category', 'id'),
  nit: 12345,
  active: false
});

factory.define('ExpiredOffer', Offer, {
  product: factory.seq('Offer.product', n => `product${n}`),
  begin: moment().subtract(2, 'days'),
  expiration: moment().subtract(1, 'days'),
  strategy: factory.assoc('TypeOffer', 'id'),
  maxRedemptions: 50,
  redemptions: 0,
  retail: 1222,
  purpose: 'Vacations',
  imageUrl: factory.seq(
    'Offer.image',
    n => `'https://s3.amazonaws.com/plink-email-assets/plink_offers/${n}.jpg`
  ),
  valueStrategy: '10%',
  categoryId: factory.assoc('Category', 'id'),
  nit: 12345,
  active: true
});

factory.define('NotBeganOffer', Offer, {
  product: factory.seq('Offer.product', n => `product${n}`),
  begin: moment().add(10, 'days'),
  expiration: moment().add(11, 'days'),
  strategy: factory.assoc('TypeOffer', 'id'),
  maxRedemptions: 50,
  redemptions: 50,
  retail: 1222,
  purpose: 'Vacations',
  imageUrl: factory.seq(
    'Offer.image',
    n => `'https://s3.amazonaws.com/plink-email-assets/plink_offers/${n}.jpg`
  ),
  valueStrategy: '10%',
  categoryId: factory.assoc('Category', 'id'),
  nit: 12345,
  active: true
});

factory.define('NoRedemptionsLeftOffer', Offer, {
  product: factory.seq('Offer.product', n => `product${n}`),
  begin: moment().subtract(1, 'days'),
  expiration: moment().add(10, 'days'),
  strategy: factory.assoc('TypeOffer', 'id'),
  maxRedemptions: 50,
  redemptions: 50,
  retail: 1222,
  purpose: 'Vacations',
  imageUrl: factory.seq(
    'Offer.image',
    n => `'https://s3.amazonaws.com/plink-email-assets/plink_offers/${n}.jpg`
  ),
  valueStrategy: '10%',
  categoryId: factory.assoc('Category', 'id'),
  nit: 12345,
  active: true
});
