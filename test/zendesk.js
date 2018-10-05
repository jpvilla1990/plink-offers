const nock = require('nock');
const chai = require('chai');
const config = require('../config');
const ZendeskService = require('../app/services/zendesk');
const ZendeskMockHelper = require('./mock-helpers/zendesk');

const should = chai.should();

describe('findGroupId(name)', () => {
  it('Should return the groupId of the group', done => {
    const groupName = 'Sarlanga';
    const groupId = 1234;
    ZendeskMockHelper.mockZendeskRequestForFoundGroupId(groupName, groupId);

    ZendeskService.findGroupId(groupName).then(id => {
      id.should.equal(groupId);
      done();
    });
  });

  it('Should not return the groupId of the group', done => {
    const groupName = 'Sarlanga';
    const groupId = 1234;
    ZendeskMockHelper.mockZendeskRequestForNotFoundGroupId(groupName, groupId);

    ZendeskService.findGroupId(groupName)
      .then(() => done(new Error('Should not be called')))
      .catch(err => {
        err.message.should.equal('Group id for zendesk not found');
        done();
      });
  });

  it('Should post a ticket', done => {
    const ticket = ZendeskService.newOfferTicket({
      nit: 1234,
      valueStrategy: 1,
      product: 'Hamburguesa',
      categoryName: 'Comida',
      groupId: 12345
    });
    ZendeskMockHelper.mockZendeskRequestForPostingTicket(ticket);
    ZendeskService.postTicket(ticket).then(res => done());
  });
});
