'use strict';

const fs = require('fs'),
  path = require('path'),
  chai = require('chai'),
  chaiHttp = require('chai-http'),
  models = require('../app/models'),
  dataCreation = require('../scripts/dataCreation'),
  db = require('../app/models');

chai.use(chaiHttp);

const getTablesQuery = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`;

const destroyTableOrder = ['category', 'type_offer', 'offer', 'code'];

beforeEach('drop tables', done => {
  const destroys = [];
  destroyTableOrder.forEach(tableName => {
    destroys.push(
      db.sequelize.transaction(transaction =>
        db.sequelize
          .query('SET FOREIGN_KEY_CHECKS = 0', { transaction })
          .then(() => {
            return db.sequelize.models[tableName].truncate({
              restartIdentity: true,
              transaction
            });
          })
          .then(() => db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction }))
      )
    );
  });
  Promise.all(destroys).then(() => done());
});

// including all test files
const normalizedPath = path.join(__dirname, '.');
fs.readdirSync(normalizedPath).forEach(file => {
  if (fs.lstatSync(`${normalizedPath}/${file}`).isDirectory()) {
    fs.readdirSync(`${normalizedPath}/${file}`).forEach(inFile => {
      require(`./${file}/${inFile}`);
    });
  } else {
    require(`./${file}`);
  }
});
