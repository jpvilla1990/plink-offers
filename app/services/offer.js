const sequelize = require('../models').sequelize,
  constants = require('../constants'),
  Offer = require('../models').offer,
  Category = require('../models').category,
  errors = require('../errors'),
  config = require('../../config'),
  { sendNewOffer } = require('../services/mailer'),
  { newOffer } = require('../services/html'),
  requestService = require('../services/request'),
  Sequelize = require('sequelize'),
  queryHelper = require('../services/queryHelper'),
  utils = require('../utils'),
  Op = Sequelize.Op;

exports.getAllBack = params => {
  const paramsQuery = {
    offset: params.offset,
    where: {},
    limit: params.limit,
    order: [['created_at', 'DESC']]
  };
  if (params.filter) {
    paramsQuery.where[Op.or] = [
      queryHelper.likeConditionsWithConcat({
        params: [sequelize.col('value_type_offer'), ' en ', sequelize.col('product')],
        value: params.filter
      }),
      queryHelper.likeByField({ field: 'nit', filter: params.filter })
    ];
  }
  return Offer.findAndCountAll(paramsQuery).catch(err => {
    throw errors.databaseError(err.message);
  });
};
exports.getAllApp = params => {
  const today = utils.moment().format('YYYY-MM-DD'),
    offerFiltering = {
      [Op.and]: [
        Sequelize.where(Sequelize.fn('lower', Sequelize.col('product')), {
          [Op.like]: `%${params.name.toLowerCase()}%`
        }),
        {
          begin: {
            [Op.lte]: today
          }
        },
        {
          expiration: {
            [Op.gte]: today
          }
        },
        {
          redemptions: {
            [Op.lt]: sequelize.col('offer.max_redemptions')
          }
        },
        {
          active: true
        }
      ]
    };
  if (params.category) offerFiltering.categoryId = params.category;
  const paramsQuery = {
    offset: params.offset,
    where: offerFiltering,
    limit: params.limit,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: sequelize.models.category,
        as: 'category'
      },
      {
        model: sequelize.models.code,
        as: 'code',
        where: { email: params.email },
        required: false
      }
    ]
  };
  return Offer.findAll(paramsQuery).catch(err => {
    throw errors.databaseError(err.message);
  });
};

exports.getDataFromOffers = list =>
  list.map(value =>
    requestService.getPoints(value.dataValues.retail).then(rv => {
      const code = value.code.length > 0 ? value.code[0].code : null,
        offerFormated = {
          idOffer: value.dataValues.id,
          image: value.dataValues.imageUrl,
          category: value.category.dataValues.name,
          product: value.dataValues.product,
          valueStrategy: value.dataValues.valueStrategy,
          expires: value.dataValues.expiration,
          maxRedemptions: value.dataValues.maxRedemptions,
          begin: value.dataValues.begin,
          retailName: rv.commerce.description,
          retailImage: rv.commerce.imageUrl,
          retailAddress: rv.address,
          retailReference: rv.reference
        };
      return code ? { ...offerFormated, code } : offerFormated;
    })
  );

exports.getDataFromRetail = offer =>
  requestService.getPoints(offer.dataValues.retail).then(retail => ({
    idOffer: offer.dataValues.id,
    image: offer.dataValues.imageUrl,
    category: offer.category.dataValues.name,
    product: offer.dataValues.product,
    valueStrategy: offer.dataValues.valueStrategy,
    expires: offer.dataValues.expiration,
    maxRedemptions: offer.dataValues.maxRedemptions,
    begin: offer.dataValues.begin,
    retailName: retail.commerce.description,
    retailImage: retail.commerce.imageUrl,
    retailAddress: retail.address,
    retailReference: retail.reference
  }));
exports.checkOfferAndFormat = (offer, formatter = () => {}) =>
  new Promise((resolve, reject) => {
    if (!offer) reject(errors.offerNotFound);
    resolve(formatter(offer));
  });
exports.getByWithCode = filter => {
  Offer.findOne({
    where: filter,
    include: [
      {
        model: sequelize.models.category,
        as: 'category'
      },
      {
        model: sequelize.models.type_offer,
        as: 'type'
      }
    ]
  }).catch(err => {
    throw errors.databaseError(err.message);
  });
};
