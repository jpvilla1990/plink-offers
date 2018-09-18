'use strict';

module.exports = (sequelize, DataTypes) => {
  const TermsAndConditions = sequelize.define('terms_and_conditions', {
    version: {
      allowNull: false,
      type: DataTypes.STRING
    },
    content: {
      allowNull: false,
      type: DataTypes.TEXT('long')
    }
  });
  TermsAndConditions.getLast = () => {
    return TermsAndConditions.findOne({
      attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
      order: [['createdAt', 'DESC']]
    });
  };
  return TermsAndConditions;
};
