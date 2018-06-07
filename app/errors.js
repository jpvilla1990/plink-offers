const internalError = (message, internalCode) => ({
  message,
  internalCode
});
exports.USER_UNAUTHORIZED = 'user_unauthorized';
exports.DEFAULT_ERROR = 'default_error';
exports.BAD_TOKEN = 'bad_token';
exports.BAD_REQUEST = 'bad_request';
exports.DATABASE_ERROR = 'database_error';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);
exports.userUnauthorized = message => internalError(message, exports.USER_UNAUTHORIZED);
exports.badToken = message => internalError(message, exports.BAD_TOKEN);
exports.badRequest = message => internalError(message, exports.BAD_REQUEST);
exports.databaseError = message => internalError(message, exports.DATABASE_ERROR);
