const nock = require('nock');
const config = require('../../config');

exports.mockZendeskRequestForFoundGroupId = (groupName, groupId) => {
  nock(`${config.common.zendesk.api.host}`)
    .get('/search.json')
    .query({ query: `type:group name:${groupName}` })
    .reply(
      200,
      {
        results: [
          {
            id: groupId
          }
        ]
      },
      {
        Authorization: `Basic ${config.common.zendesk.api.token}`
      }
    );
};

exports.mockZendeskRequestForNotFoundGroupId = (groupName, groupId) => {
  nock(`${config.common.zendesk.api.host}`)
    .get('/search.json')
    .query({ query: `type:group name:${groupName}` })
    .reply(
      200,
      {
        results: []
      },
      {
        Authorization: `Basic ${config.common.zendesk.api.token}`
      }
    );
};

exports.mockZendeskRequestForPostingTicket = ticket => {
  nock(`${config.common.zendesk.api.host}`)
    .post('/tickets.json', { ticket })
    .reply(201, undefined, {
      Authorization: `Basic ${config.common.zendesk.api.token}`
    });
};
