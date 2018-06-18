const moment = require('moment-timezone'),
  { OFFER_ACTIVE, OFFER_INACTIVE } = require('./constants'),
  config = require('../config');

moment.tz.setDefault(config.common.timezone);

exports.getOfferStatus = offer => {
  const afterExpires = moment().isSameOrBefore(moment(offer.expiration).endOf('day')),
    beforeBegin = moment().isSameOrAfter(moment(offer.begin).startOf('day'));
  return afterExpires && beforeBegin && offer.redemptions < offer.maxRedemptions;
};

exports.getOfferStatusString = offer => (exports.getOfferStatus(offer) ? OFFER_ACTIVE : OFFER_INACTIVE);

exports.moment = moment;
