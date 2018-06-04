'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .createTable('type_offers', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        title: {
          type: Sequelize.STRING
        },
        count: {
          type: Sequelize.INTEGER
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deleted_at: {
          type: Sequelize.DATE
        }
      })
      .then(() =>
        queryInterface.addColumn('offers', 'type', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'type_offers',
            field: 'id'
          }
        })
      ),
  down: (queryInterface, Sequelize) =>
    queryInterface.dropTable('type_offers').then(() => queryInterface.removeColumn('offers', 'type'))
};
