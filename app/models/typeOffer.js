'use strict';

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
  return typeOffer;
};
