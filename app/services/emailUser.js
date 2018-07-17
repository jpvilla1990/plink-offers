const utils = require('../utils'),
  constants = require('../constants'),
  requestService = require('../services/request'),
  Code = require('../models').code;

exports.map = list => {
  const emailWithOffers = new Array(),
    retails = new Array();
  list.rows.forEach(value => {
    if (!emailWithOffers[value.email]) {
      emailWithOffers[value.email] = new Array();
    }
    if (constants.OFFER_ACTIVE === utils.getOfferStatusString(value.offer.dataValues)) {
      if (!retails[value.offer.dataValues.retail]) {
        return requestService.retail(`/points/${value.offer.dataValues.retail}`).then(rv => {
          retails.push({
            retailName: rv.commerce.description,
            retailAddress: rv.address
          });
        });
      }
      return Code.getBy({ email: value.email }).then(exist => {
        const offerFormated = {
          image: value.offer.dataValues.imageUrl,
          category: value.offer.category.dataValues.name,
          product: value.offer.dataValues.product,
          valueStrategy: value.offer.dataValues.valueStrategy,
          expires: value.offer.dataValues.expiration,
          code: exist ? exist.code : 0
        };
        emailWithOffers[value.email].push(offerFormated);
      });
    }
  });
  return emailWithOffers;
};
