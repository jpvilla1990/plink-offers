const factory = require('./factoryManager').factory,
  Offer = require('../../app/models').offer;

exports.nameFactory = 'Offer';

factory.define(exports.nameFactory, Offer, {});
