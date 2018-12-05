const factory = require('./factoryManager').factory,
  Category = require('../../app/models').category;

exports.nameFactory = 'Category';

factory.define(exports.nameFactory, Category, {
  name: factory.seq('Category.name', n => `name${n}`),
  description: factory.seq('Category.description', n => `description${n}`),
  special: false
});
