'use strict';

const initialSpecialOffers = require('../migrations/seeds/initialSpecialOffers'),
  Category = require('../../app/models').category,
  moment = require('moment'),
  now = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
  up: queryInterface =>
    queryInterface
      .bulkInsert('categories', [{ name: 'Bancolombia', created_at: now, updated_at: now, special: true }])
      .then(bancolombiaId =>
        initialSpecialOffers(bancolombiaId).then(specialOffers =>
          queryInterface.bulkInsert('offers', specialOffers)
        )
      ),

  down: queryInterface =>
    Category.findOne({ where: { name: 'Bancolombia' } }).then(category =>
      initialSpecialOffers(category.id).then(specialOffers => {
        specialOffers.map(specialOffer => queryInterface.bulkDelete('offers', specialOffer));
        queryInterface.bulkDelete('categories', [{ id: category.id }]);
      })
    )
};
