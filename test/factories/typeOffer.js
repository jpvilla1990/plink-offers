const factory = require('./factoryManager').factory,
  typeOffer = require('../../app/models').type_offer;

exports.nameFactory = 'TypeOffer';

factory.define(exports.nameFactory, typeOffer, {});
