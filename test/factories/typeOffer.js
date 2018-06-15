const factory = require('./factoryManager').factory,
  typeOffer = require('../../app/models').type_offer;

exports.nameFactory = 'TypeOffer';

factory.define(exports.nameFactory, typeOffer, {
  description: factory.seq('TypeOffer.description', n => `description${n}`)
});
