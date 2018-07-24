const TypeOffer = require('../models').type_offer;

exports.getAllTypes = (req, res, next) =>
  TypeOffer.findAll()
    .then(result => res.send({ result }))
    .catch(next);
