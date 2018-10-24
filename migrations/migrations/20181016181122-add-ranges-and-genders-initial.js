'use strict';

const ranges = [
    'Menores de 17 años',
    '17 a 24 años',
    '25 a 36 años',
    '37 a 49 años',
    '50 a 64 años',
    'Mayores de 65 años'
  ],
  genders = ['Hombre', 'Mujer'],
  moment = require('moment'),
  now = moment().format('YYYY-MM-DD HH:mm:ss'),
  { GENDER, RANGE } = require('../../app/constants');

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .bulkInsert(
        'targets',
        ranges.map(range => ({ description: range, created_at: now, updated_at: now, type: RANGE }))
      )
      .then(() =>
        queryInterface.bulkInsert(
          'targets',
          genders.map(gender => ({ description: gender, created_at: now, updated_at: now, type: GENDER }))
        )
      ),
  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface
      .bulkDelete('targets', {
        [Op.or]: ranges.map(range => ({ description: range }))
      })
      .then(() =>
        queryInterface.bulkDelete('targets', {
          [Op.or]: genders.map(gender => ({ description: gender }))
        })
      );
  }
};
