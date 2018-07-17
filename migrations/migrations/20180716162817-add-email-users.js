'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .createTable('email_users', {
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
        queryInterface.addIndex('email_users', ['email', 'offer_id'], {
          indicesType: 'UNIQUE'
        })
      ),

  down: (queryInterface, Sequelize) => {
    queryInterface
      .removeIndex('email_users', ['email', 'offer_id'])
      .then(() => queryInterface.dropTable('email_users'));
  }
};
