const factory = require('./factoryManager').factory,
  emailUser = require('../../app/models').email_user;

exports.nameFactory = 'emailUser';

factory.define(exports.nameFactory, emailUser, {
  email: factory.chance('email'),
  offerId: factory.assoc('Offer', 'id')
});
