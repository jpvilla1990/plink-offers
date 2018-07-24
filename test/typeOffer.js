const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryTypeOffer = require('../test/factories/typeOffer').nameFactory;

describe('/type-offers GET', () => {
  it('should success find of type-offers', done => {
    factoryManager.createMany(factoryTypeOffer, 10, { description: 'loca' }).then(() => {
      chai
        .request(server)
        .get('/type-offers')
        .then(response => {
          response.should.have.status(200);
          response.body.should.have.property('result');
          response.body.result.length.should.be.equal(10);
          dictum.chai(response);
        })
        .then(() => done());
    });
  });
});
