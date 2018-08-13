'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('offers', 'active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('offers', 'active')
};
