const factory = require('./factoryManager').factory,
  Category = require('../../app/models').category;

exports.nameFactory = 'Category';

factory.define(exports.nameFactory, Category, {});
