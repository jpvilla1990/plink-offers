const Category = require('../models').category;

exports.getAllCategories = (req, res, next) =>
  Category.findAll()
    .then(result => res.send({ result }))
    .catch(next);
