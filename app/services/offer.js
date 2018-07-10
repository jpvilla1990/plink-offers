const utils = require('../utils');

exports.map = off => {
  const send = {
    image: off.dataValues.imageUrl,
    product: off.dataValues.product,
    begin: off.dataValues.begin,
    expires: off.dataValues.expiration,
    maxRedemptions: off.dataValues.maxRedemptions,
    redemptions: off.dataValues.redemptions,
    status: utils.getOfferStatusString(off.dataValues),
    category: off.category.name,
    typeOffer: off.type.description.toUpperCase(),
    valueStrategy: off.dataValues.valueStrategy
  };
  return send;
};
