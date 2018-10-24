'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .createTable('targets', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        description: {
          type: Sequelize.STRING,
          allowNull: false
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deleted_at: {
          type: Sequelize.DATE
        }
      })
      .then(() =>
        queryInterface
          .addColumn('offers', 'ranges', {
            type: Sequelize.STRING
          })
          .then(() =>
            queryInterface.addColumn('offers', 'genders', {
              type: Sequelize.STRING
            })
          )
      ),
  down: (queryInterface, Sequelize) =>
    queryInterface
      .dropTable('targets')
      .then(() =>
        queryInterface
          .removeColumn('offers', 'ranges')
          .then(() => queryInterface.removeColumn('offers', 'genders'))
      )
};
