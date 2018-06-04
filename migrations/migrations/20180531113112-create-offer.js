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
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      detail: {
        type: Sequelize.STRING
      },
      begin: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expiration: {
        type: Sequelize.DATE,
        allowNull: false
      },
      category: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      min_age: {
        type: Sequelize.INTEGER
      },
      max_age: {
        type: Sequelize.INTEGER
      },
      gender: {
        type: Sequelize.STRING
      },
      max_redemptions: {
        type: Sequelize.INTEGER
      },
      terms: {
        type: Sequelize.STRING
      },
      post: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      purpose: {
        type: Sequelize.STRING
      },
      img: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
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
