'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .changeColumn('offers', 'begin', {
        type: Sequelize.DATEONLY,
        allowNull: false
      })
      .then(() =>
        queryInterface.changeColumn('offers', 'expiration', {
          type: Sequelize.DATEONLY,
          allowNull: false
        })
      ),
  down: (queryInterface, Sequelize) => {
    queryInterface
      .changeColumn('offers', 'begin', {
        type: Sequelize.DATE,
        allowNull: false
      })
      .then(() =>
        queryInterface.changeColumn('offers', 'expiration', {
          type: Sequelize.DATE,
          allowNull: false
        })
      );
  }
};
