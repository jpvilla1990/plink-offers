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
exports.EXISTING_MAIL = 'existing_mail';
exports.USER_NOT_FOUND = 'user_not_found';
exports.EXISTING_USER = 'existing_user';
exports.NONEXISTENTOFFER = 'nonexistent_offer';
exports.OFFER_DISABLED = 'offer_disabled';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);
exports.userUnauthorized = internalError('User is not authorized', exports.USER_UNAUTHORIZED);
exports.badRequest = message => internalError(message, exports.BAD_REQUEST);
exports.databaseError = message => internalError(message, exports.DATABASE_ERROR);
exports.codeNotFound = internalError('Code Not Found', exports.CODE_NOT_FOUND);
exports.codeRedeemed = internalError('Code Redeemed', exports.CODE_REDEEMED);
exports.offerInactive = internalError('Offer Inactive', exports.OFFER_INACTIVE);
exports.offerNotFound = internalError('Offer Not Found', exports.OFFER_NOT_FOUND);
exports.existingMail = internalError('Already exist a code for this email', exports.EXISTING_MAIL);
exports.existingUser = internalError('Already exist a user for this email', exports.EXISTING_USER);
exports.nonExistentOffer = internalError('The offer does not exist', exports.NONEXISTENTOFFER);
exports.userNotFound = internalError('User not found', exports.USER_NOT_FOUND);
exports.offerDisabled = internalError('Offer Disabled', exports.OFFER_DISABLED);
exports.points = internalError('Error when tried to obtain data from commerce', exports.DEFAULT_ERROR);
