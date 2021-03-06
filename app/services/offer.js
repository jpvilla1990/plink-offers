const sequelize = require('../models').sequelize,
  Offer = require('../models').offer,
  errors = require('../errors'),
  requestService = require('../services/points'),
  Sequelize = require('sequelize'),
  queryHelper = require('../services/queryHelper'),
  utils = require('../utils'),
  Op = Sequelize.Op;

exports.getAllBack = params => {
  const paramsQuery = {
    offset: params.offset,
    where: {},
    limit: params.limit,
    order: [['created_at', 'DESC']],
    include: [
      {
        model: sequelize.models.category,
        as: 'category'
      }
    ]
  };
  if (params.filter) {
    paramsQuery.where[Op.or] = [
      queryHelper.likeConditionsWithConcat({
        params: [sequelize.col('value_type_offer'), ' en ', sequelize.col('product')],
        value: params.filter
      }),
      queryHelper.likeByField({ field: 'nit', filter: params.filter }),
      Sequelize.where(Sequelize.fn('lower', Sequelize.col('offer.description')), {
        [Op.like]: `%${params.filter.toLowerCase()}%`
      })
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
        {
          [Op.or]: [
            Sequelize.where(Sequelize.fn('lower', Sequelize.col('product')), {
              [Op.like]: `%${params.name.toLowerCase()}%`
            }),
            Sequelize.where(Sequelize.fn('lower', Sequelize.col('offer.description')), {
              [Op.like]: `%${params.name.toLowerCase()}%`
            })
          ]
        },
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
        },
        {
          posId: {
            [Op.in]: params.posIds
          }
        }
      ]
    };
  if (params.category) offerFiltering.categoryId = params.category;
  const paramsQuery = {
    offset: params.offset,
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
    ],
    where: offerFiltering,
    subQuery: false
  };
  return Offer.findAndCountAll(paramsQuery).catch(err => {
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
          special: value.dataValues.category.special,
          description: value.dataValues.description,
          linkTerms: value.dataValues.linkTerms,
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
    retailReference: retail.reference,
    description: offer.dataValues.description,
    linkTerms: offer.dataValues.linkTerms,
    special: offer.category.special
  }));
exports.checkOfferAndFormat = (offer, formatter = () => {}) =>
  new Promise((resolve, reject) => {
    if (!offer) reject(errors.offerNotFound);
    resolve(formatter(offer));
  });
exports.getByApp = ({ email, id }) =>
  Offer.findOne({
    where: { id },
    include: [
      {
        model: sequelize.models.category,
        as: 'category'
      },
      {
        model: sequelize.models.code,
        as: 'code',
        where: { email },
        required: false
      }
    ]
  }).catch(err => {
    throw errors.databaseError(err.message);
  });
