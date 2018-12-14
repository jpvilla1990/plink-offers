'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('offers', 'pos_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('offers', 'pos_id')
};
