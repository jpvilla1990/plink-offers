'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .addColumn('targets', 'alias', {
        type: Sequelize.STRING
      })
      .then(() =>
        queryInterface.sequelize
          .query(`UPDATE targets SET alias='<17' WHERE description like '%Menores de 17%'`)
          .then(() =>
            queryInterface.sequelize.query(
              `UPDATE targets SET alias='17-24' WHERE description like '%17 a 24%'`
            )
          )
          .then(() =>
            queryInterface.sequelize.query(
              `UPDATE targets SET alias='25-36' WHERE description like '%25 a 36%'`
            )
          )
          .then(() =>
            queryInterface.sequelize.query(
              `UPDATE targets SET alias='37-49' WHERE description like '%37 a 49%'`
            )
          )
          .then(() =>
            queryInterface.sequelize.query(
              `UPDATE targets SET alias='50-64' WHERE description like '%50 a 64%'`
            )
          )
          .then(() =>
            queryInterface.sequelize.query(
              `UPDATE targets SET alias='>64' WHERE description like '%Mayores de 64%'`
            )
          )
      ),

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('targets', 'alias')
};
