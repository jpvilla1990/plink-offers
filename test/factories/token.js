const jwt = require('jwt-simple'),
  config = require('../../config');

exports.generate = ({ email, points, offers = true, documentNumber = '39832486' }) =>
  jwt.encode(
    { email, points, offers, 'custom:document_number': documentNumber },
    config.common.session.secret
  );
