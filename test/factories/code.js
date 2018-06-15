const factory = require('./factoryManager').factory,
  Code = require('../../app/models').code;

exports.nameFactory = 'Code';

factory.define(exports.nameFactory, Code, {
  code: factory.seq('Code.code', n => `code${n}`),
  email: factory.chance('email'),
  offerId: factory.assoc('Offer', 'id'),
  dateRedemption: null
});
