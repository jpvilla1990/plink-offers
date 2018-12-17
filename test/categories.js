const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  expect = chai.expect,
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
            expect(response.status).to.be.eql(200);
            expect(response.body).to.have.property('result');
            expect(response.body.result.length).to.be.eql(22);
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
          expect(response.status).to.be.eql(200);
          expect(response.body).to.have.property('result');
          expect(response.body.result.length).to.be.eql(0);
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
            expect(response.status).to.be.eql(200);
            expect(response.body).to.have.property('result');
            expect(response.body.result[0].special).to.be.true;
            done();
          })
      )
    );
  });
});
