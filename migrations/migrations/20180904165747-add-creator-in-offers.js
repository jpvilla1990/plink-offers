'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('offers', 'email_creator', {
      type: Sequelize.STRING
    }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('offers', 'email_creator')
};
