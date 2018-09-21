'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('offers', 'date_inactive', {
      type: Sequelize.DATE
    }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('offers', 'date_inactive')
};
