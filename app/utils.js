const moment = require('moment-timezone'),
  config = require('../config');

moment.tz.setDefault(config.common.database.timezone);

exports.getStatus = offer => {
  const afterExpires = moment().isSameOrBefore(offer.expires, 'days'),
    beforeBegin = moment().isSameOrAfter(offer.begin, 'days');
  return afterExpires && beforeBegin && offer.redemptions < offer.maxRedemptions;
};
