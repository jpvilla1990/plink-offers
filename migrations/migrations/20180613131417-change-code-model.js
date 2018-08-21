'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .renameColumn('codes', 'offer', 'offer_id')
      .then(() => queryInterface.renameColumn('codes', 'dateRedemption', 'date_redemption'))
      .then(() =>
        queryInterface.changeColumn('codes', 'date_redemption', { type: Sequelize.DATE, allowNull: true })
      ),

  down: (queryInterface, Sequelize) =>
    queryInterface
      .renameColumn('codes', 'offer_id', 'offer')
      .then(() =>
        queryInterface.changeColumn('codes', 'date_redemption', { type: Sequelize.DATE, allowNull: false })
      )
      .then(() => queryInterface.renameColumn('codes', 'date_redemption', 'dateRedemption'))
};
