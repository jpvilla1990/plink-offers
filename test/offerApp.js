const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  requestService = require('../app/services/request'),
  simple = require('simple-mock'),
  token = require('../test/factories/token'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryOffer = require('../test/factories/offer').nameFactory,
  factoryCategory = require('../test/factories/category').nameFactory,
  factoryEmailUser = require('../test/factories/emailUser').nameFactory,
  factoryCode = require('../test/factories/code').nameFactory;

describe('/offer-app/offers GET', () => {
  const generateToken = (email = 'julian.molina@wolox.com.ar') => `bearer ${token.generate({ email })}`,
    email = 'julian.molina@wolox.com.ar';
  simple.mock(requestService, 'retail').resolveWith({
    address: 'Cochabamba 3254',
    commerce: { description: 'McDonalds', nit: '112233' },
    posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
  });
  it('should be success get one offers for specific category ( food ) ', done => {
    Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryCategory, { name: 'food' }),
      factoryManager.create(factoryOffer, { categoryId: 1 }),
      factoryManager.create(factoryOffer, { categoryId: 2 })
    ])
      .then()
      .then(() => {
        Promise.all([
          factoryManager.create(factoryCode, { email, offerId: 1 }),
          factoryManager.create(factoryCode, { email, offerId: 2 }),
          factoryManager.create(factoryEmailUser, { email, offerId: 1 }),
          factoryManager.create(factoryEmailUser, { email, offerId: 2 })
        ])
          .then()
          .then(() => {
            chai
              .request(server)
              .get(`/offer-app/offers?page=0&category=2`)
              .set('authorization', generateToken())
              .then(response => {
                response.should.have.status(200);
                response.body.count.should.eqls(1);
                response.body.offers.length.should.eqls(1);
                dictum.chai(response);
                done();
              });
          });
      });
  });
  it('should be success get two offers', done => {
    Promise.all([factoryManager.create(factoryOffer), factoryManager.create(factoryOffer)])
      .then()
      .then(() => {
        Promise.all([
          factoryManager.create(factoryCode, { email, offerId: 1 }),
          factoryManager.create(factoryCode, { email, offerId: 2 }),
          factoryManager.create(factoryEmailUser, { email, offerId: 1 }),
          factoryManager.create(factoryEmailUser, { email, offerId: 2 })
        ])
          .then()
          .then(() => {
            chai
              .request(server)
              .get(`/offer-app/offers?page=0`)
              .set('authorization', generateToken())
              .then(response => {
                response.should.have.status(200);
                response.body.count.should.eqls(2);
                response.body.offers.length.should.eqls(2);
                done();
              });
          });
      });
  });
  it('should be success get one offer', done => {
    const otherEmail = 'julian.molina+false@wolox.com.ar';
    Promise.all([factoryManager.create(factoryOffer), factoryManager.create(factoryOffer)])
      .then()
      .then(() => {
        Promise.all([
          factoryManager.create(factoryCode, { email, offerId: 1 }),
          factoryManager.create(factoryCode, { email, offerId: 2 }),
          factoryManager.create(factoryEmailUser, { email, offerId: 1 }),
          factoryManager.create(factoryEmailUser, { email: otherEmail, offerId: 2 })
        ])
          .then()
          .then(() => {
            chai
              .request(server)
              .get(`/offer-app/offers?page=0`)
              .set('authorization', generateToken())
              .then(response => {
                response.should.have.status(200);
                response.body.count.should.eqls(1);
                response.body.offers.length.should.eqls(1);
                done();
              });
          });
      });
  });
  it('should fail because the page was not sent', done => {
    chai
      .request(server)
      .get(`/offer-app/offers?`)
      .set('authorization', generateToken())
      .then(response => {
        response.should.have.status(200);
        response.body.offers.length.should.eqls(0);
        done();
      });
  });
});
