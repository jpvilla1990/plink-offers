const { body, query, check, validationResult } = require('express-validator/check'),
  errors = require('../errors'),
  logger = require('../logger');

const verifyExist = key =>
  body(key)
    .exists()
    .withMessage(`The ${key} is required`);

const verifyExistQuery = key =>
  query(key)
    .exists()
    .withMessage(`The ${key} is required`);

const verifyIntGreaterThanZero = (result, key) =>
  result.isInt([{ min: 1 }]).withMessage(`The ${key} must be integer greater than 0`);

const verifyString = (result, key) => result.isString().withMessage(`The ${key} must be String`);
const verifyInteger = (result, key) => result.isInt().withMessage(`The ${key} must be Integer`);
const verifyEmail = (result, key) => result.isEmail().withMessage(`The ${key} must be valid`);
const verifyArray = (result, key) =>
  result
    .isArray()
    .withMessage(`The ${key} must be array`)
    .custom(value => value.length > 0)
    .withMessage(`The ${key} must contain elements`);
exports.checkAll = [
  verifyString(verifyExist('product'), 'product'),
  verifyString(verifyExist('begin'), 'begin'),
  verifyString(verifyExist('expiration'), 'expiration'),
  verifyInteger(verifyExist('category'), 'category'),
  verifyInteger(verifyExist('strategy'), 'strategy'),
  verifyString(verifyExist('valueStrategy'), 'valueStrategy'),
  verifyIntGreaterThanZero(verifyExist('maxRedemptions'), 'maxRedemptions'),
  verifyString(verifyExist('purpose'), 'purpose'),
  verifyString(verifyExist('url'), 'url'),
  verifyArray(verifyExist('ranges'), 'ranges'),
  verifyArray(verifyExist('genders'), 'genders'),
  verifyInteger(verifyExist('posId'), 'posId')
];
exports.checkQuery = [verifyInteger(verifyExistQuery('page'), 'page')];
exports.checkEmail = [verifyEmail(verifyExist('email'), 'email')];
exports.checkEmailHash = [verifyString(verifyExist('email'), 'email')];
exports.validate = (req, res, next) => {
  const errorsMessages = validationResult(req).array();
  if (errorsMessages.length !== 0) {
    next(errors.badRequest(errorsMessages.map(error => error.msg)));
  } else {
    next();
  }
};
