const chai = require('chai'),
  dictum = require('dictum.js'),
  moment = require('moment'),
  server = require('./../app'),
  requestService = require('../app/services/request'),
  simple = require('simple-mock'),
  expect = chai.expect,
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

  const someOffersWithIncludeTextInName = text => {
    return Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryCategory, { name: 'shoes' }),
      factoryManager.create(factoryOffer, { categoryId: 1, product: `${text}landia` }),
      factoryManager.create(factoryOffer, { categoryId: 2, product: `Z${text}tos Carlitos` })
    ]).then(() => {
      return Promise.all([
        factoryManager.create(factoryCode, { email, offerId: 1 }),
        factoryManager.create(factoryCode, { email, offerId: 2 }),
        factoryManager.create(factoryEmailUser, { email, offerId: 1 }),
        factoryManager.create(factoryEmailUser, { email, offerId: 2 })
      ]);
    });
  };

  it('should be success get one offers for like product name', done => {
    const text = 'apa';
    someOffersWithIncludeTextInName(text).then(() => {
      chai
        .request(server)
        .get(`/offer-app/offers?page=0&name=${text}`)
        .set('authorization', generateToken())
        .then(response => {
          response.should.have.status(200);
          response.body.count.should.eqls(2);
          response.body.offers.length.should.eqls(2);
          response.body.offers[0].product.toLowerCase().should.include(text);
          response.body.offers[1].product.toLowerCase().should.include(text);
          done();
        });
    });
  });

  it('should not get offers for like product name', done => {
    const text = 'apa';
    someOffersWithIncludeTextInName(text).then(() => {
      chai
        .request(server)
        .get(`/offer-app/offers?page=0&name=xyz`)
        .set('authorization', generateToken())
        .then(response => {
          response.should.have.status(200);
          response.body.count.should.eqls(0);
          response.body.offers.length.should.eqls(0);
          done();
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

  it('should be success get no offers, because they are expired', done => {
    Promise.all([factoryManager.create('ExpiredOffer'), factoryManager.create('ExpiredOffer')])
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
                response.body.count.should.eqls(0);
                response.body.offers.length.should.eqls(0);
                done();
              });
          });
      });
  });

  it('should be success get no offers, because they not began', done => {
    Promise.all([factoryManager.create('NotBeganOffer'), factoryManager.create('NotBeganOffer')])
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
                response.body.count.should.eqls(0);
                response.body.offers.length.should.eqls(0);
                done();
              });
          });
      });
  });

  it('should be success get no offers, because they dont have redemptions left', done => {
    Promise.all([
      factoryManager.create('NoRedemptionsLeftOffer'),
      factoryManager.create('NoRedemptionsLeftOffer')
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
              .get(`/offer-app/offers?page=0`)
              .set('authorization', generateToken())
              .then(response => {
                response.should.have.status(200);
                response.body.count.should.eqls(0);
                response.body.offers.length.should.eqls(0);
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
  it('should be success but the page was not sent', done => {
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
  it('should be fail because getPoints does not work', done => {
    simple.restore();
    Promise.all([factoryManager.create(factoryOffer, { retail: 4635 })]).then(() =>
      Promise.all([factoryManager.create(factoryEmailUser, { email, offerId: 1 })]).then(() =>
        chai
          .request(server)
          .get(`/offer-app/offers`)
          .set('authorization', generateToken())
          .then(response => {
            response.should.have.status(500);
            response.body.should.have.property('message');
            expect(response.body.message).to.equal('Error when tried to obtain data from commerce');
            response.body.should.have.property('internal_code');
            expect(response.body.internal_code).to.equal('default_error');
            done();
          })
      )
    );
  });
});

describe('/offer-app/codes GET', () => {
  const generateToken = (email = 'julian.molina@wolox.com.ar') => `bearer ${token.generate({ email })}`,
    email = 'julian.molina@wolox.com.ar';
  it('should be success but the page was not sent', done => {
    chai
      .request(server)
      .get(`/offer-app/codes`)
      .set('authorization', generateToken())
      .then(response => {
        response.should.have.status(200);
        response.body.codes.length.should.eqls(0);
        done();
      });
  });
  it('should be success get two codes', done => {
    factoryManager.create(factoryOffer).then(off1 => {
      factoryManager.create(factoryOffer).then(off2 => {
        factoryManager.create(factoryCode, { email, offerId: off1.dataValues.id }).then(() => {
          factoryManager
            .create(factoryCode, {
              email,
              offerId: off2.dataValues.id
            })
            .then(() => {
              chai
                .request(server)
                .get(`/offer-app/codes?page=0`)
                .set('authorization', generateToken())
                .then(response => {
                  response.should.have.status(200);
                  response.body.count.should.eqls(2);
                  response.body.codes.length.should.eqls(2);
                  dictum.chai(response);
                  done();
                });
            });
        });
      });
    });
  });
  it('should be success get one code because one offer after 3 days', done => {
    factoryManager.create(factoryOffer).then(off1 => {
      factoryManager.create(factoryOffer, { expiration: moment().diff(7, 'days') }).then(off2 => {
        factoryManager.create(factoryCode, { email, offerId: off1.dataValues.id }).then(() => {
          factoryManager
            .create(factoryCode, {
              email,
              offerId: off2.dataValues.id
            })
            .then(() => {
              chai
                .request(server)
                .get(`/offer-app/codes?page=0`)
                .set('authorization', generateToken())
                .then(response => {
                  response.should.have.status(200);
                  response.body.count.should.eqls(1);
                  response.body.codes.length.should.eqls(1);
                  done();
                });
            });
        });
      });
    });
  });
  it('should be success get one code because one code was redeem after 3 days', done => {
    factoryManager.create(factoryOffer).then(off1 => {
      factoryManager.create(factoryOffer).then(off2 => {
        factoryManager.create(factoryCode, { email, offerId: off1.dataValues.id }).then(() => {
          factoryManager
            .create(factoryCode, {
              email,
              offerId: off2.dataValues.id,
              dateRedemption: moment().diff(5, 'days')
            })
            .then(() => {
              chai
                .request(server)
                .get(`/offer-app/codes?page=0`)
                .set('authorization', generateToken())
                .then(response => {
                  response.should.have.status(200);
                  response.body.count.should.eqls(1);
                  response.body.codes.length.should.eqls(1);
                  done();
                });
            });
        });
      });
    });
  });
});
