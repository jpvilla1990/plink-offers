const config = require('../config').common.database;

module.exports = {
  development: {
    username: config.username,
    password: config.password,
    database: config.name,
    host: config.host,
    dialect: 'mysql',
    logging: true
  },
  staging: {
    username: config.username,
    password: config.password,
    database: config.name,
    host: config.host,
    dialect: 'mysql',
    logging: false
  },
  testing: {
    username: config.username,
    password: config.password,
    database: config.name,
    host: config.host,
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: config.username,
    password: config.password,
    database: config.name,
    host: config.host,
    dialect: 'mysql',
    logging: false
  }
};
