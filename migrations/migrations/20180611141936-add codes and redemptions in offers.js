'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .addColumn('offers', 'codes', {
        type: Sequelize.INTEGER
      })
      .then(() => {
        queryInterface.addColumn('offers', 'redemptions', {
          type: Sequelize.INTEGER
        });
      }),
  down: (queryInterface, Sequelize) =>
    queryInterface.removeColumn('offers', 'codes').then(() => {
      queryInterface.removeColumn('offers', 'redemptions');
    })
};
