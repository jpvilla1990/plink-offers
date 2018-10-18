'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('email_users', 'hash_email', {
      type: Sequelize.STRING
    }),
  down: (queryInterface, Sequelize) => queryInterface.removeColumn('email_users', 'hash_email')
};
