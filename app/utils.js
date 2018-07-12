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

exports.mask = email => {
  const userName = email.split('@'),
    count = parseInt(userName[0].length * 0.6),
    countDomain = parseInt(userName[1].length * 0.4);
  if (userName[0].length <= 8) {
    return `${'*'.repeat(5)}@${userName[1]}`;
  } else {
    return `${userName[0].slice(0, 4)}${'*'.repeat(count)}@${'*'.repeat(countDomain)}${userName[1].slice(
      countDomain,
      userName[1].length
    )}`;
  }
};
