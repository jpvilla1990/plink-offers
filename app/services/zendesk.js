const rp = require('request-promise'),
  errors = require('../errors'),
  config = require('../../config');

const requestToZendesk = (uri, body, queryParams = {}) =>
  rp.post(`${config.common.zendesk.api.host}/${uri}`, {
    headers: { authorization: `Basic ${config.common.zendesk.api.token}` },
    json: true,
    body,
    qs: queryParams
  });

exports.newOfferTicket = data => ({
  subject: 'Oferta Creada',
  comment: {
    body: `Nit Empresa: ${data.nit}
        Título Oferta: ${data.valueStrategy} en ${data.product}
        Categoría Oferta: ${data.categoryName}`
  },
  group_id: data.groupId
});

exports.postTicket = ({ mail, ticket }) =>
  requestToZendesk('users/create_or_update', { user: { email: mail } })
    .then(zendeskUser =>
      requestToZendesk(
        'tickets',
        { ticket: { ...ticket, requester_id: zendeskUser.user.id } },
        { async: true }
      )
    )
    .catch(err => {
      throw errors.defaultError(err.error.message);
    });

exports.findGroupId = name =>
  rp({
    method: 'GET',
    qs: {
      query: `type:group name:${name}`
    },
    uri: `${config.common.zendesk.api.host}/search.json`,
    headers: {
      Authorization: `Basic ${config.common.zendesk.api.token}`
    },
    json: true
  }).then(
    res => (res.results.length > 0 ? res.results[0].id : Promise.reject(errors.zendeskGroupIdNotFound))
  );
