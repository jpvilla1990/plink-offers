'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.renameColumn('codes', 'dateRedemption', 'date_redemption').then(() =>
      queryInterface
        .changeColumn('codes', 'date_redemption', {
          allowNull: false,
          type: Sequelize.DATEONLY
        })
        .then(() =>
          queryInterface.changeColumn('codes', 'code', {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
          })
        )
    ),
  down: (queryInterface, Sequelize) =>
    queryInterface.renameColumn('codes', 'date_redemption', 'dateRedemption').then(() =>
      queryInterface
        .changeColumn('codes', 'dateRedemption', {
          allowNull: false,
          type: Sequelize.DATE
        })
        .then(() =>
          queryInterface.changeColumn('codes', 'code', {
            allowNull: false,
            type: Sequelize.STRING
          })
        )
    )
};
