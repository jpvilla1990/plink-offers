const factory = require('./factoryManager').factory,
  emailUser = require('../../app/models').email_user;

exports.nameFactory = 'emailUser';

factory.define(exports.nameFactory, emailUser, {
  email: factory.chance('email'),
  hashEmail: factory.seq('emailUser.hashEmail', n => `hash${n}`),
  offerId: factory.assoc('Offer', 'id')
});
