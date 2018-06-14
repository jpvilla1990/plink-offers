const codeService = require('../services/code');

exports.redeemCode = ({ params }, res, next) =>
  codeService
    .redeemCode({ retailId: params.id, code: params.code })
    .then(() => res.status(200).end())
    .catch(next);
