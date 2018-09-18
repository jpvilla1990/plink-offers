const TermsAndConditions = require('../models').terms_and_conditions;
const errors = require('../errors');

exports.get = (req, res, next) => {
  return TermsAndConditions.getLast()
    .then(tac => {
      if (tac) {
        res.status(200).json(tac);
      } else {
        next(errors.termsAndConditionsNotFound);
      }
    })
    .catch(next);
};
