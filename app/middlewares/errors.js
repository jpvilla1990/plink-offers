const errors = require('../errors'),
  logger = require('../logger');

const DEFAULT_STATUS_CODE = 500;

const statusCodes = {
  [errors.BAD_REQUEST]: 400,
  [errors.OFFER_INACTIVE]: 400,
  [errors.CODE_NOT_FOUND]: 404,
  [errors.OFFER_NOT_FOUND]: 404,
  [errors.USER_NOT_FOUND]: 404,
  [errors.EXISTING_MAIL]: 400,
  [errors.CODE_REDEEMED]: 400,
  [errors.NONEXISTENTOFFER]: 400,
  [errors.EXISTING_USER]: 400,
  [errors.SAVING_ERROR]: 400,
  [errors.DATABASE_ERROR]: 503,
  [errors.USER_UNAUTHORIZED]: 401,
  [errors.DEFAULT_ERROR]: 500
};

exports.handle = (error, req, res, next) => {
  if (error.internalCode) {
    res.status(statusCodes[error.internalCode] || DEFAULT_STATUS_CODE);
  } else {
    // Unrecognized error, notifying it to rollbar.
    next(error);
    res.status(DEFAULT_STATUS_CODE);
  }
  logger.error(error);
  return res.send({
    message: error.message,
    internal_code: error.internalCode
  });
};
