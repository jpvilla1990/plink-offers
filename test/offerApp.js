const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  requestService = require('../app/services/request'),
  simple = require('simple-mock'),
  token = require('../test/factories/token'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryOffer = require('../test/factories/offer').nameFactory,
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
  it('should be success get two offers', done => {
    factoryManager.create(factoryOffer).then(off1 => {
      const firstId = off1.dataValues.id;
      factoryManager.create(factoryOffer).then(off2 => {
        const secondId = off2.dataValues.id;
        factoryManager.create(factoryCode, { email, offerId: off1.dataValues.id }).then(() => {
          factoryManager
            .create(factoryCode, {
              email,
              offerId: off2.dataValues.id
            })
            .then(() => {
              factoryManager
                .create(factoryEmailUser, {
                  email,
                  offerId: firstId
                })
                .then(() => {
                  factoryManager
                    .create(factoryEmailUser, {
                      email,
                      offerId: secondId
                    })
                    .then(() => {
                      chai
                        .request(server)
                        .get(`/offer-app/offers?page=0`)
                        .set('authorization', generateToken())
                        .then(response => {
                          response.should.have.status(200);
                          response.body.count.should.eqls(2);
                          response.body.offers.length.should.eqls(2);
                          dictum.chai(response);
                          done();
                        });
                    });
                });
            });
        });
      });
    });
  });
  it('should be success get one offer', done => {
    const otherEmail = 'julian.molina+false@wolox.com.ar';
    factoryManager.create(factoryOffer).then(off1 => {
      const firstId = off1.dataValues.id;
      factoryManager.create(factoryOffer).then(off2 => {
        const secondId = off2.dataValues.id;
        factoryManager.create(factoryCode, { email, offerId: off1.dataValues.id }).then(() => {
          factoryManager
            .create(factoryCode, {
              email,
              offerId: off2.dataValues.id
            })
            .then(() => {
              factoryManager
                .create(factoryEmailUser, {
                  email,
                  offerId: firstId
                })
                .then(() => {
                  factoryManager
                    .create(factoryEmailUser, {
                      email: otherEmail,
                      offerId: secondId
                    })
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
        });
      });
    });
  });
  it('should fail because the page was not sent', done => {
    factoryManager.create(factoryOffer).then(off1 => {
      const firstId = off1.dataValues.id;
      factoryManager.create(factoryOffer).then(off2 => {
        const secondId = off2.dataValues.id;
        factoryManager.create(factoryCode, { email, offerId: off1.dataValues.id }).then(() => {
          factoryManager
            .create(factoryCode, {
              email,
              offerId: off2.dataValues.id
            })
            .then(() => {
              factoryManager
                .create(factoryEmailUser, {
                  email,
                  offerId: firstId
                })
                .then(() => {
                  factoryManager
                    .create(factoryEmailUser, {
                      email,
                      offerId: secondId
                    })
                    .then(() => {
                      chai
                        .request(server)
                        .get(`/offer-app/offers?`)
                        .set('authorization', generateToken())
                        .then(response => {
                          response.should.have.status(400);
                          response.body.should.have.property('message');
                          response.body.should.have.property('internal_code');
                          done();
                        });
                    });
                });
            });
        });
      });
    });
  });
});
