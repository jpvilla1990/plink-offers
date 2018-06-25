'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.renameColumn('offers', 'img_extension', 'image_url'),

  down: (queryInterface, Sequelize) => queryInterface.renameColumn('offers', 'image_url', 'img_extension')
};
