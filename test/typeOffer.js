const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  factoryManager = require('../test/factories/factoryManager'),
  expect = chai.expect,
  factoryTypeOffer = require('../test/factories/typeOffer').nameFactory;

describe('/type-offers GET', () => {
  it('should success find of type-offers', done => {
    factoryManager.createMany(factoryTypeOffer, 10, { description: 'loca' }).then(() => {
      chai
        .request(server)
        .get('/type-offers')
        .then(response => {
          expect(response.status).to.be.eql(200);
          expect(response.body).to.have.property('result');
          expect(response.body.result.length).to.be.eql(10);
          dictum.chai(response);
          done();
        });
    });
  });
});
