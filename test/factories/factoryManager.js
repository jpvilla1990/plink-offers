const factoryGirl = require('factory-girl'),
  factory = factoryGirl.factory,
  SequelizeAdapter = new factoryGirl.SequelizeAdapter();

factory.setAdapter(SequelizeAdapter);

exports.factory = factory;

exports.chance = (type, options = {}) => factory.chance(type, options);

exports.create = (name, options = {}) => factory.create(name, options, {});

exports.createMany = (name, quantity = 1, options = {}) => factory.createMany(name, quantity, options, {});

exports.build = (name, options = {}) => factory.build(name, options, {});
