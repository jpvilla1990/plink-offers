const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryCategory = require('../test/factories/category').nameFactory;

describe('/categories GET', () => {
  it('should success find of categories', done => {
    factoryManager.createMany(factoryCategory, 22, { name: 'travel' }).then(() =>
      factoryManager.createMany(factoryCategory, 4, { special: true }).then(() =>
        chai
          .request(server)
          .get('/categories')
          .then(response => {
            response.should.have.status(200);
            response.body.should.have.property('result');
            response.body.result.length.should.be.equal(22);
            dictum.chai(response);
            done();
          })
      )
    );
  });
  it('should success find categories but the count of categories is zero because only exist special categories ', done => {
    factoryManager.createMany(factoryCategory, 4, { special: true }).then(() =>
      chai
        .request(server)
        .get('/categories')
        .then(response => {
          response.should.have.status(200);
          response.body.should.have.property('result');
          response.body.result.length.should.be.equal(0);
          done();
        })
    );
  });
  it('should success find categories ordered ', done => {
    factoryManager.createMany(factoryCategory, 4).then(() =>
      factoryManager.create(factoryCategory, { special: true }).then(() =>
        chai
          .request(server)
          .get('/offer-app/categories')
          .then(response => {
            response.should.have.status(200);
            response.body.should.have.property('result');
            response.body.result[0].special.should.be.equal(true);
            done();
          })
      )
    );
  });
});
