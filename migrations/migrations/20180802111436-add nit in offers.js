'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('offers', 'nit', {
      type: Sequelize.INTEGER
    }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('offers', 'nit')
};
