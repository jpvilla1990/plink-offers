'use strict';

const moment = require('moment'),
  now = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.query(
      `INSERT INTO type_offers (description,created_at,updated_at) SELECT 'PERCENTAGE','${now}','${now}' WHERE NOT EXISTS(SELECT description FROM type_offers WHERE description="PERCENTAGE")`
    ),
  down: (queryInterface, Sequelize) =>
    queryInterface.sequelize.query(`DELETE FROM type_offers WHERE id NOT IN (select strategy from offers);`)
};
