'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addIndex('codes', ['email', 'offer_id'], {
      indicesType: 'UNIQUE'
    }),
  down: (queryInterface, Sequelize) => queryInterface.removeIndex('codes', ['email', 'offer_id'])
};
