const factory = require('./factoryManager').factory,
  TermsAndConditions = require('../../app/models').terms_and_conditions;

exports.FakeTermsAndConditions = {
  version: '0.0.0',
  content: `
    # Fake Terms and Conditions
  `
};

factory.define('FakeTermsAndConditions', TermsAndConditions, exports.FakeTermsAndConditions);
