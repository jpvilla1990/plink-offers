'use strict';

const DefaultTermsAndConditonsSeed = require('./seeds/defaultTermsAndConditions');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`INSERT INTO terms_and_conditions 
    (version, content, createdAt, updatedAt)
    VALUES('${DefaultTermsAndConditonsSeed.version}',
    '${DefaultTermsAndConditonsSeed.content}', CURTIME(), CURTIME())`);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `DELETE FROM terms_and_conditions where version = '${DefaultTermsAndConditonsSeed.version}'`
    );
  }
};
