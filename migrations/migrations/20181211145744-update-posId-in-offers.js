'use strict';

const Promise = require('bluebird'),
  requestService = require('../../app/services/points'),
  environment = require('../../config').common.environment;

const getPointsMigration = retail => {
  if (environment !== 'production' && environment !== 'staging') {
    return Promise.resolve({ posTerminals: [{ posId: 1 }] });
  }
  return requestService.getPoints(retail);
};
module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.query('SELECT DISTINCT(retail) FROM offers').then(([retails]) =>
      Promise.map(
        retails,
        ({ retail }) =>
          getPointsMigration(retail).then(({ posTerminals }) => ({ posId: posTerminals[0].posId, retail })),
        { concurrency: 3 }
      ).then(points =>
        Promise.map(
          points,
          ({ retail, posId }) =>
            queryInterface.sequelize.query(`UPDATE offers SET pos_id = ${posId} WHERE retail = ${retail}`),
          { concurrency: 3 }
        ).then(() =>
          queryInterface.changeColumn('offers', 'pos_id', {
            type: Sequelize.INTEGER,
            allowNull: false
          })
        )
      )
    ),
  down: (queryInterface, Sequelize) =>
    queryInterface.changeColumn('offers', 'pos_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
};
