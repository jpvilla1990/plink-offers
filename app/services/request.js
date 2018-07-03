const rp = require('request-promise'),
  config = require('../../config');

exports.retail = endpoint => {
  const options = {
    uri: `${config.common.server.info_retail}${endpoint}`,
    json: true
  };
  return rp(options);
};
