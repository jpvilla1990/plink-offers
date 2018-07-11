const uuid = require('uuid'),
  Sequelize = require('sequelize'),
  errors = require('../errors'),
  Code = require('../models').code;

exports.verify = offer =>
  Code.createModel(offer).catch(err => {
    if (err instanceof Sequelize.UniqueConstraintError && err.fields.codes_email_offer_id) {
      throw errors.existingMail;
    } else {
      if (err instanceof Sequelize.UniqueConstraintError && err.fields.code) {
        offer.code = uuid().slice(0, 8);
        return exports.verify(offer);
      }
      throw errors.databaseError(err.message);
    }
  });
