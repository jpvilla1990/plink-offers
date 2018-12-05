'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.changeColumn('offers', 'product', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.changeColumn('offers', 'max_redemptions', {
        type: Sequelize.INTEGER,
        allowNull: true
      }),
      queryInterface.changeColumn('offers', 'purpose', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('offers', 'link', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.changeColumn('offers', 'strategy', {
        type: Sequelize.INTEGER,
        allowNull: true
      }),
      queryInterface.changeColumn('offers', 'value_type_offer', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('offers', 'description', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('categories', 'special', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }),
      queryInterface.changeColumn('offers', 'max_redemptions', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      })
    ]),

  down: (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.changeColumn('offers', 'product', {
        type: Sequelize.STRING,
        allowNull: false
      }),
      queryInterface.changeColumn('offers', 'max_redemptions', {
        type: Sequelize.INTEGER,
        allowNull: false
      }),
      queryInterface.changeColumn('offers', 'purpose', {
        type: Sequelize.STRING,
        allowNull: false
      }),
      queryInterface.changeColumn('offers', 'strategy', {
        type: Sequelize.INTEGER,
        allowNull: false
      }),
      queryInterface.changeColumn('offers', 'value_type_offer', {
        type: Sequelize.STRING,
        allowNull: false
      }),
      queryInterface.removeColumn('offers', 'link'),
      queryInterface.removeColumn('offers', 'description'),
      queryInterface.removeColumn('categories', 'special'),
      queryInterface.changeColumn('offers', 'max_redemptions', {
        type: Sequelize.INTEGER,
        allowNull: true
      })
    ])
};
