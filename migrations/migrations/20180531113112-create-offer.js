'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('offers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product: {
        type: Sequelize.STRING,
        allowNull: false
      },
      begin: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expiration: {
        type: Sequelize.DATE,
        allowNull: false
      },
      max_redemptions: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      value_type_offer: {
        type: Sequelize.STRING,
        allowNull: false
      },
      retail: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      purpose: {
        type: Sequelize.STRING,
        allowNull: false
      },
      img_extension: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('offers');
  }
};
