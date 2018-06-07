const { body, query, check, validationResult } = require('express-validator/check'),
  errors = require('../errors'),
  logger = require('../logger');

const verifyExist = key =>
  body(key)
    .exists()
    .withMessage(`The ${key} is required`);

const verifyString = (result, key) => result.isString().withMessage(`The ${key} must be String`);
const verifyInteger = (result, key) => result.isInt().withMessage(`The ${key} must be Integer`);
exports.checkAll = [
  verifyString(verifyExist('product'), 'product'),
  verifyString(verifyExist('begin'), 'begin'),
  verifyString(verifyExist('expiration'), 'expiration'),
  verifyInteger(verifyExist('category'), 'category'),
  verifyInteger(verifyExist('strategy'), 'strategy'),
  verifyString(verifyExist('valueStrategy'), 'valueStrategy'),
  verifyInteger(verifyExist('maxRedemptions'), 'maxRedemptions'),
  verifyString(verifyExist('purpose'), 'purpose'),
  verifyString(verifyExist('extension'), 'extension')
];
exports.validate = (req, res, next) => {
  const errorsMessages = validationResult(req).array();
  if (errorsMessages.length !== 0) {
    next(errors.badRequest(errorsMessages.map(error => error.msg)));
  } else {
    next();
  }
};
