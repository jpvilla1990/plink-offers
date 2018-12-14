'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .addColumn('offers', 'pos_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      })
      .then(() => queryInterface.dropTable('user_offers')),
  down: (queryInterface, Sequelize) =>
    queryInterface.removeColumn('offers', 'pos_id').then(() =>
      queryInterface.createTable('user_offers', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false
        },
        offer_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'offers',
            field: 'id'
          }
        },
        hash_email: {
          type: Sequelize.STRING
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
    )
};
