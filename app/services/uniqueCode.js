const uuid = require('uuid'),
  Sequelize = require('sequelize'),
  sequelize = require('../models').sequelize,
  errors = require('../errors'),
  Offer = require('../models').offer,
  Code = require('../models').code;

exports.verify = offer =>
  sequelize.transaction(transaction =>
    Code.createModel(offer, transaction)
      .catch(err => {
        if (err instanceof Sequelize.UniqueConstraintError && err.fields.codes_email_offer_id) {
          throw errors.existingMail;
        } else {
          if (err instanceof Sequelize.UniqueConstraintError && err.fields.code) {
            offer.code = uuid().slice(0, 8);
            return exports.verify(offer);
          }
          throw errors.databaseError(err.message);
        }
      })
      .then(newCode =>
        Offer.incrementField('codes', { id: newCode.offerId }, transaction).then(() => newCode)
      )
  );
