const factory = require('./factoryManager').factory,
  Target = require('../../app/models').target;

factory.define('Gender', Target, {
  description: factory.seq('Range.description', n => `Gender ${n}`),
  type: 'gender'
});
factory.define('Range', Target, {
  description: factory.seq('Range.description', n => `Range ${n}`),
  type: 'range'
});
