'use strict';

const oldCategories = require('../migrations/seeds/oldCategories'),
  newCategories = require('../migrations/seeds/newCategories'),
  moment = require('moment'),
  now = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize
      .query(`INSERT INTO categories (name,created_at,updated_at) VALUES("Tecnología",CURTIME(),CURTIME())`)
      .then(() =>
        queryInterface.sequelize
          .query(`UPDATE offers SET category_id=(SELECT MAX(id) FROM categories)`)
          .then(() =>
            queryInterface.sequelize
              .query(`SELECT MAX(id) FROM categories`, { type: queryInterface.sequelize.QueryTypes.SELECT })
              .then(result =>
                queryInterface.sequelize
                  .query(`DELETE FROM categories WHERE NOT id=${result[0]['MAX(id)']}`)
                  .then(() =>
                    queryInterface.bulkInsert(
                      'categories',
                      newCategories.map(name => ({ name, created_at: now, updated_at: now }))
                    )
                  )
              )
          )
      ),
  down: (queryInterface, Sequelize) =>
    queryInterface.sequelize
      .query(`INSERT INTO categories (name,created_at,updated_at) VALUES("Alimentos",CURTIME(),CURTIME());`)
      .then(() =>
        queryInterface.sequelize
          .query(`UPDATE offers SET category_id=(SELECT id FROM categories WHERE name= "Alimentos");`)
          .then(() =>
            queryInterface.sequelize
              .query(`DELETE FROM categories WHERE NOT name="Alimentos";`)
              .then(() =>
                queryInterface.bulkInsert(
                  'categories',
                  oldCategories.map(name => ({ name, created_at: now, updated_at: now }))
                )
              )
          )
      )
};
