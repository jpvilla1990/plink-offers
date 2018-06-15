'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .changeColumn('offers', 'codes', {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      })
      .then(() =>
        queryInterface.changeColumn('offers', 'redemptions', {
          allowNull: false,
          type: Sequelize.INTEGER,
          defaultValue: 0
        })
      ),
  down: (queryInterface, Sequelize) =>
    queryInterface
      .changeColumn('offers', 'codes', {
        type: Sequelize.INTEGER
      })
      .then(() =>
        queryInterface.changeColumn('offers', 'redemptions', {
          type: Sequelize.INTEGER
        })
      )
};
