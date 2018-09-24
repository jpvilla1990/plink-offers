const rp = require('request-promise'),
  errors = require('../errors'),
  config = require('../../config');

const retail = endpoint => {
  const options = {
    uri: `${config.common.server.info_retail}${endpoint}`,
    json: true
  };
  return rp(options).catch(err => {
    throw errors.points;
  });
};

exports.getPoints = id => retail(`/points/${id}`);

// {
//   commerce: {
//     description: string,
//     nit: number
//   },
//   imageUrl: string,
//   address: string
// }
