const { getOfferStatus, moment } = require('../utils'),
  constants = require('../constants'),
  errors = require('../errors'),
  requestService = require('../services/request');

exports.getDataFromOffers = list => {
  const emailWithOffers = new Array();
  list.forEach(value => {
    if (constants.OFFER_ACTIVE === getOfferStatus(value.offer.dataValues)) {
      emailWithOffers.push(
        requestService.getPoints(value.offer.dataValues.retail).then(rv => {
          const code = value.offer.code.length > 0 ? value.offer.code[0].code : null,
            offerFormated = {
              idOffer: value.offer.dataValues.id,
              image: value.offer.dataValues.imageUrl,
              category: value.offer.category.dataValues.name,
              product: value.offer.dataValues.product,
              valueStrategy: value.offer.dataValues.valueStrategy,
              expires: value.offer.dataValues.expiration,
              maxRedemptions: value.offer.dataValues.maxRedemptions,
              begin: value.offer.dataValues.begin,
              retailName: rv.commerce.description,
              retailImage: rv.commerce.imageUrl,
              retailAddress: rv.address
            };
          return code ? { ...offerFormated, code } : offerFormated;
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
    dateRedemption: code.dataValues.dateRedemption
      ? moment(code.dataValues.dateRedemption).format('YYYY-MM-DD')
      : null,
    status: getOfferStatus(code.offer.dataValues),
    idOffer: code.offer.dataValues.id
  }));
  return emailWithCodes;
};
const checkAfterThreeDays = value =>
  moment().isAfter(moment(value)) ? moment().diff(moment(value), 'days') < 3 : true;

exports.deleteAfterThreeDays = codes =>
  codes.filter(value => {
    const expirationAfterThreeDays = checkAfterThreeDays(value.offer.dataValues.expiration);
    if (value.dateRedemption) {
      const dateRedemptionAfterThreeDays = checkAfterThreeDays(value.dateRedemption);
      return expirationAfterThreeDays && dateRedemptionAfterThreeDays;
    }
    return expirationAfterThreeDays;
  });
