const moment = require('moment-timezone'),
  { OFFER_ACTIVE, OFFER_INACTIVE, OFFER_DISABLED } = require('./constants'),
  { HIDE_EMAIL } = require('./constants'),
  config = require('../config');

moment.tz.setDefault(config.common.timezone);

exports.getOfferStatus = offer => {
  if (offer.active) {
    const afterExpires = moment().isSameOrBefore(moment(offer.expiration).endOf('day')),
      beforeBegin = moment().isSameOrAfter(moment(offer.begin).startOf('day'));
    return afterExpires && beforeBegin && offer.redemptions < offer.maxRedemptions
      ? OFFER_ACTIVE
      : OFFER_INACTIVE;
  }
  return OFFER_DISABLED;
};

exports.map = off => {
  const send = {
    image: off.dataValues.imageUrl,
    product: off.dataValues.product,
    begin: off.dataValues.begin,
    expires: off.dataValues.expiration,
    maxRedemptions: off.dataValues.maxRedemptions,
    redemptions: off.dataValues.redemptions,
    status: exports.getOfferStatus(off.dataValues),
    category: off.category.name,
    typeOffer: off.type.description.toUpperCase(),
    valueStrategy: off.dataValues.valueStrategy
  };
  return send;
};
exports.moment = moment;

exports.mask = email => {
  const userName = email.split('@');
  if (userName[0].length <= 8) {
    return `${'*'.repeat(5)}@${userName[1]}`;
  } else {
    return `${userName[0].slice(0, HIDE_EMAIL)}${'*'.repeat(4)}@${userName[1].slice(
      0,
      HIDE_EMAIL
    )}${'*'.repeat(4)}`;
  }
};
