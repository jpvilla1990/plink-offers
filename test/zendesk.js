const chai = require('chai'),
  ZendeskService = require('../app/services/zendesk'),
  ZendeskMockHelper = require('./mock-helpers/zendesk'),
  expect = chai.expect,
  nock = require('nock');

const mockZendesk = (code, uri = '', message = {}) =>
  nock(`https://test.zendesk.com/api/v2`)
    .persist()
    .post(`/${uri}`)
    .query(true)
    .reply(code, message);

describe('findGroupId(name)', () => {
  it('Should return the groupId of the group', done => {
    const groupName = 'Sarlanga';
    const groupId = 1234;
    ZendeskMockHelper.mockZendeskRequestForFoundGroupId(groupName, groupId);
    ZendeskService.findGroupId(groupName).then(id => {
      expect(id).to.be.equal(groupId);
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
        expect(err.message).to.be.equal('Group id for zendesk not found');
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
    mockZendesk(200, 'tickets');
    mockZendesk(200, 'users/create_or_update', { user: { id: 1 } });
    ZendeskService.postTicket({ mail: 'test@test.com', ticket }).then(res => done());
  });
});
