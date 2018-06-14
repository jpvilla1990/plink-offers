const moment = require('moment-timezone'),
  config = require('../config');

moment.tz.setDefault(config.common.timezone);

exports.getOfferStatus = offer => {
  const afterExpires = moment().isSameOrBefore(moment(offer.expires).endOf('day')),
    beforeBegin = moment().isSameOrAfter(moment(offer.begin).startOf('day'));
  return afterExpires && beforeBegin && offer.redemptions < offer.maxRedemptions;
};
