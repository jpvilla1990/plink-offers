'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.renameColumn('offers', 'category', 'category_id'),
  down: (queryInterface, Sequelize) => queryInterface.renameColumn('offers', 'category_id', 'category')
};
