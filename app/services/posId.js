const rp = require('request-promise'),
  errors = require('../errors'),
  attr = require('dynamodb-data-types').AttributeValue,
  config = require('../../config');

exports.getPosIdsByDocumentNumber = documentNumber =>
  rp({
    uri: `${config.common.server.info_pos_id}/${documentNumber}`,
    json: true
  })
    .then(
      res =>
        res.Items.length !== 0 && res.Items[0].commerce_ids ? attr.unwrap(res.Items[0]).commerce_ids : []
    )
    .catch(err => {
      throw errors.recommendationServiceFail(err.message);
    });
