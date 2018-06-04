'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .createTable('categories', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.STRING
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
        queryInterface.addColumn('offers', 'category', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'categories', key: 'id' }
        })
      ),
  down: (queryInterface, Sequelize) =>
    queryInterface.dropTable('categories').then(() => queryInterface.removeColumn('offers', 'category'))
};
