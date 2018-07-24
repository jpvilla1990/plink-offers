const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryCategory = require('../test/factories/category').nameFactory;

describe('/categories GET', () => {
  it('should success find of categories', done => {
    factoryManager.createMany(factoryCategory, 22, { name: 'travel' }).then(() => {
      chai
        .request(server)
        .get('/categories')
        .then(response => {
          response.should.have.status(200);
          response.body.should.have.property('result');
          response.body.result.length.should.be.equal(22);
          dictum.chai(response);
        })
        .then(() => done());
    });
  });
});
