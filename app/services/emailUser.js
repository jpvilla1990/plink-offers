const utils = require('../utils'),
  constants = require('../constants'),
  requestService = require('../services/request');

exports.getDataFromOffers = list => {
  const emailWithOffers = new Array();
  list.forEach(value => {
    if (constants.OFFER_ACTIVE === utils.getOfferStatus(value.offer.dataValues)) {
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

exports.getDataFromCodes = codes => {
  const emailWithCodes = codes.map(code => ({
    product: code.offer.dataValues.product,
    valueStrategy: code.offer.dataValues.valueStrategy,
    expires: code.offer.dataValues.expiration,
    code: code.dataValues.code,
    dateRedemption: code.dataValues.dateRedemption,
    status: utils.getOfferStatus(code.offer.dataValues)
  }));
  return emailWithCodes;
};
