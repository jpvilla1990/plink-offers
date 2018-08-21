const sequelize = require('../models').sequelize,
  constants = require('../constants'),
  Offer = require('../models').offer,
  Category = require('../models').category,
  errors = require('../errors'),
  config = require('../../config'),
  { sendNewOffer } = require('../services/mailer'),
  { newOffer } = require('../services/html'),
  { retail } = require('../services/request'),
  Sequelize = require('sequelize'),
  queryHelper = require('../services/queryHelper'),
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
