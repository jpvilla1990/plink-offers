'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.renameTable('email_users', 'user_offers'),
  down: (queryInterface, Sequelize) => queryInterface.renameTable('user_offers', 'email_users')
};
