const factory = require('./factoryManager').factory,
  moment = require('moment'),
  Offer = require('../../app/models').offer;

exports.nameFactory = 'Offer';

factory.define(exports.nameFactory, Offer, {
  product: factory.seq('Offer.product', n => `product${n}`),
  begin: moment().subtract(1, 'days'),
  expiration: moment().add(2, 'days'),
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
  active: true,
  genders: 'Male,Female',
  ranges: 'smaller than 17 years,18 to 23',
  posId: 1234
});

factory.define('ActiveOffer', Offer, {
  product: factory.seq('Offer.product', n => `product${n}`),
  begin: moment().subtract(1, 'days'),
  expiration: moment().add(2, 'days'),
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
  active: true,
  genders: 'Male,Female',
  ranges: 'smaller than 17 years,18 to 23',
  posId: 1234
});

factory.define('DisabledOffer', Offer, {
  product: factory.seq('Offer.product', n => `product${n}`),
  begin: moment().subtract(1, 'days'),
  expiration: moment().add(2, 'days'),
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
  active: false,
  dateInactive: moment(),
  posId: 1234
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
  active: true,
  posId: 1234
});

factory.define('NotBeganOffer', Offer, {
  product: factory.seq('Offer.product', n => `product${n}`),
  begin: moment().add(10, 'days'),
  expiration: moment().add(2, 'days'),
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
  active: true,
  posId: 1234
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
  active: true,
  posId: 1234
});

factory.define('SpecialOffer', Offer, {
  begin: moment().subtract(1, 'days'),
  expiration: moment().add(10, 'days'),
  retail: 1222,
  imageUrl: factory.seq(
    'Offer.image',
    n => `'https://s3.amazonaws.com/plink-email-assets/plink_offers/${n}.jpg`
  ),
  categoryId: factory.assoc('Category', 'id'),
  active: true,
  linkUrl: factory.seq('Offer.link', n => `www.google.com/image-${n}`),
  description: factory.seq('Offer.description', n => `description${n}`),
  posId: 1234
});
