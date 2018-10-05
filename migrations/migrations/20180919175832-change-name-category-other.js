'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.query(`UPDATE categories SET name='Otros' WHERE name='Otro'`),

  down: (queryInterface, Sequelize) =>
    queryInterface.sequelize.query(`UPDATE categories SET name='Otro' WHERE name='Otros'`)
};
