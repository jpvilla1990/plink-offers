const Category = require('../models').category;

const getAll = condition => Category.findAllCategories(condition);

exports.getAllCategoriesApp = (req, res, next) =>
  getAll()
    .then(result => res.send({ result }))
    .catch(next);
exports.getAllCategoriesDashboard = (req, res, next) =>
  getAll({ special: false })
    .then(result => res.send({ result }))
    .catch(next);
