const moment = require('moment-timezone'),
  { OFFER_ACTIVE, OFFER_INACTIVE, OFFER_DISABLED, OFFER_FINISHED } = require('./constants'),
  { HIDE_EMAIL } = require('./constants'),
  config = require('../config');

moment.tz.setDefault(config.common.timezone);

exports.getOfferStatus = offer => {
  if (offer.active) {
    const beforeBegin = moment().isBefore(moment(offer.begin).startOf('day'));
    const afterBegin = moment().isSameOrAfter(moment(offer.begin).startOf('day'));
    const beforeExpires = moment().isSameOrBefore(moment(offer.expiration).endOf('day'));
    if (beforeBegin) {
      return OFFER_INACTIVE;
    } else if (afterBegin && beforeExpires) {
      return offer.redemptions < offer.maxRedemptions ? OFFER_ACTIVE : OFFER_FINISHED;
    } else {
      return OFFER_FINISHED;
    }
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
    valueStrategy: off.dataValues.valueStrategy,
    genders: off.dataValues.genders ? off.dataValues.genders.split(',') : undefined,
    ranges: off.dataValues.ranges ? off.dataValues.ranges.split(',') : undefined
  };
  return send;
};
exports.moment = moment;

exports.mask = email => {
  const userName = email.split('@');
  if (userName[0].length <= config.common.server.count_mask_mail + 1) {
    return `${'*'.repeat(config.common.server.count_mask_mail)}@${userName[1].slice(
      0,
      HIDE_EMAIL
    )}${'*'.repeat(config.common.server.count_mask_mail)}`;
  } else {
    return `${userName[0].slice(0, HIDE_EMAIL)}${'*'.repeat(
      config.common.server.count_mask_mail
    )}@${userName[1].slice(0, HIDE_EMAIL)}${'*'.repeat(config.common.server.count_mask_mail)}`;
  }
};

exports.getDataForBack = offers =>
  offers.map(value => ({
    id: value.id,
    retail: value.retail,
    nit: value.nit,
    image: value.imageUrl,
    begin: value.begin,
    expires: value.expiration,
    status: exports.getOfferStatus(value.dataValues),
    creationDate: moment(value.dataValues.created_at).format('YYYY-MM-DD'),
    title: `${value.valueStrategy} en ${value.product}`
  }));
