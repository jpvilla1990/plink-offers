'use strict';

const errors = require('../errors');

module.exports = (sequelize, DataTypes) => {
  const typeOffer = sequelize.define(
    'type_offer',
    {
      description: DataTypes.STRING
    },
    {
      paranoid: true,
      underscored: true
    }
  );

  typeOffer.findAllTypes = () =>
    typeOffer.findAll().catch(err => {
      throw errors.databaseError(err.message);
    });
  return typeOffer;
};
