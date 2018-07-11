const internalError = (message, internalCode) => ({
  message,
  internalCode
});

exports.USER_UNAUTHORIZED = 'user_unauthorized';
exports.DEFAULT_ERROR = 'default_error';
exports.BAD_REQUEST = 'bad_request';
exports.DATABASE_ERROR = 'database_error';
exports.CODE_NOT_FOUND = 'code_not_found';
exports.CODE_REDEEMED = 'code_redeemed';
exports.OFFER_INACTIVE = 'offer_inactive';
exports.OFFER_NOT_FOUND = 'offer_not_found';
exports.EXISTING_MAIL = 'Already exist a code for this email';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);
exports.userUnauthorized = internalError('User is not authorized', exports.USER_UNAUTHORIZED);
exports.badRequest = message => internalError(message, exports.BAD_REQUEST);
exports.databaseError = message => internalError(message, exports.DATABASE_ERROR);
exports.codeNotFound = internalError('Code Not Found', exports.CODE_NOT_FOUND);
exports.codeRedeemed = internalError('Code Redeemed', exports.CODE_REDEEMED);
exports.offerInactive = internalError('Offer Inactive', exports.OFFER_INACTIVE);
exports.existingMail = internalError('Existing mail', exports.EXISTING_MAIL);
exports.offerNotFound = internalError('Offer not found', exports.OFFER_NOT_FOUND);
