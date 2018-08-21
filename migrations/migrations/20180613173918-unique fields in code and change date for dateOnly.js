'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('codes', 'code', {
      allowNull: false,
      type: Sequelize.STRING,
      unique: true
    }),
  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('codes', 'code', {
      allowNull: false,
      type: Sequelize.STRING
    })
};
