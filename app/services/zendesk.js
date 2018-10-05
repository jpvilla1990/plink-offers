const rp = require('request-promise'),
  errors = require('../errors'),
  config = require('../../config');

exports.newOfferTicket = data => ({
  subject: 'Oferta Creada',
  comment: {
    body: `Nit Empresa: ${data.nit}
        Título Oferta: ${data.valueStrategy} en ${data.product}
        Categoría Oferta: ${data.categoryName}`
  },
  group_id: data.groupId
});
exports.postTicket = ticket =>
  rp({
    method: 'POST',
    uri: `${config.common.zendesk.api.host}/tickets.json`,
    body: {
      ticket
    },
    headers: {
      Authorization: `Basic ${config.common.zendesk.api.token}`
    },
    json: true
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
