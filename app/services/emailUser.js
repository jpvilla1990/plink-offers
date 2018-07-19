const utils = require('../utils'),
  constants = require('../constants'),
  requestService = require('../services/request'),
  Code = require('../models').code;

exports.map = list => {
  const emailWithOffers = new Array();
  list.forEach(value => {
    if (constants.OFFER_ACTIVE === utils.getOfferStatusString(value.offer.dataValues)) {
      emailWithOffers.push(
        requestService.retail(`/points/${value.offer.dataValues.retail}`).then(rv => {
          const offerFormated = {
            idOffer: value.offer.dataValues.id,
            image: value.offer.dataValues.imageUrl,
            category: value.offer.category.dataValues.name,
            product: value.offer.dataValues.product,
            valueStrategy: value.offer.dataValues.valueStrategy,
            expires: value.offer.dataValues.expiration,
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
