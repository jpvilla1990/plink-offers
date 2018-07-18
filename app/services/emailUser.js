const utils = require('../utils'),
  constants = require('../constants'),
  requestService = require('../services/request'),
  Code = require('../models').code;

exports.map = list => {
  const emailWithOffers = new Array();
  list.rows.forEach(value => {
    if (constants.OFFER_ACTIVE === utils.getOfferStatusString(value.offer.dataValues)) {
      emailWithOffers.push(
        requestService.retail(`/points/${value.offer.dataValues.retail}`).then(rv => {
          const offerFormated = {
            image: value.offer.dataValues.imageUrl,
            category: value.offer.category.dataValues.name,
            product: value.offer.dataValues.product,
            valueStrategy: value.offer.dataValues.valueStrategy,
            expires: value.offer.dataValues.expiration,
            code: value.offer.code.length > 0 ? value.offer.code[0].dataValues.code : 0,
            retailName: rv.commerce.description,
            retailAddress: rv.address
          };
          return offerFormated;
        })
      );
    }
  });
  return emailWithOffers;
};
