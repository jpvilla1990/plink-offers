const chai = require('chai'),
  dictum = require('dictum.js'),
  moment = require('moment'),
  server = require('./../app'),
  requestService = require('../app/services/request'),
  simple = require('simple-mock'),
  expect = chai.expect,
  { OFFER_OUT_OF_STOCK, OFFER_ACTIVE, OFFER_FINISHED, OFFER_DISABLED } = require('../app/constants'),
  token = require('../test/factories/token'),
  cognitoService = require('../app/services/cognito'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryOffer = require('../test/factories/offer').nameFactory,
  factoryCategory = require('../test/factories/category').nameFactory,
  factoryUserOffer = require('../test/factories/userOffer').nameFactory,
  factoryCode = require('../test/factories/code').nameFactory,
  expectedErrorKeys = ['message', 'internal_code'],
  email = 'julian.molina@wolox.com.ar';

const generateToken = (mail = email) => `bearer ${token.generate({ email: mail, points: '11' })}`;

describe('/offer-app/offers GET', () => {
  simple.mock(requestService, 'getPoints').resolveWith({
    address: 'Cochabamba 3254',
    reference: 'Next to McDonalds',
    commerce: { description: 'McDonalds', nit: '112233', imageUrl: '' },
    posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
  });
  it.skip('should be success get one offers for specific category ( food ) ', done => {
    Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryCategory, { name: 'food' }),
      factoryManager.create(factoryOffer, { categoryId: 1 }),
      factoryManager.create(factoryOffer, { categoryId: 2 }),
      factoryManager.create(factoryOffer, { categoryId: 2 })
    ]).then(() => {
      Promise.all([
        factoryManager.create(factoryCode, { email, offerId: 1 }),
        factoryManager.create(factoryCode, { email, offerId: 2 }),
        factoryManager.create(factoryUserOffer, { email, offerId: 1 }),
        factoryManager.create(factoryUserOffer, { email, offerId: 2 }),
        factoryManager.create(factoryUserOffer, { email: 'domain@fake.com.ar', offerId: 2 })
      ]).then(() => {
        chai
          .request(server)
          .get(`/offer-app/offers?page=0&category=2`)
          .set('authorization', generateToken())
          .then(response => {
            expect(response.status).to.be.eql(200);
            expect(response.body.count).to.be.eql(1);
            expect(response.body.offers.length).to.be.eql(1);
            dictum.chai(response);
            done();
          });
      });
    });
  });

  const someOffersWithIncludeTextInName = text =>
    Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryCategory, { name: 'shoes' })
    ]).then(() =>
      Promise.all([
        factoryManager.create(factoryOffer, { categoryId: 1, product: `${text}landia` }),
        factoryManager.create(factoryOffer, { categoryId: 2, product: `Z${text}tos Carlitos` })
      ]).then(() =>
        Promise.all([
          factoryManager.create(factoryCode, { email, offerId: 1 }),
          factoryManager.create(factoryCode, { email, offerId: 2 }),
          factoryManager.create(factoryUserOffer, { email, offerId: 1 }),
          factoryManager.create(factoryUserOffer, { email, offerId: 2 })
        ])
      )
    );

  it('should be success get one offers for like product name', done => {
    const text = 'apa';
    someOffersWithIncludeTextInName(text).then(() => {
      chai
        .request(server)
        .get(`/offer-app/offers?page=0&name=${text}`)
        .set('authorization', generateToken())
        .then(response => {
          expect(response.status).to.be.eql(200);
          expect(response.body.count).to.be.eql(2);
          expect(response.body.offers.length).to.be.eql(2);
          expect(response.body.offers[0].product.toLowerCase()).to.include(text);
          expect(response.body.offers[1].product.toLowerCase()).to.include(text);
          done();
        });
    });
  });

  it('should be success get offers for like product name with offer special', done => {
    const text = 'apa';
    someOffersWithIncludeTextInName(text).then(() => {
      factoryManager.create(factoryCategory, { special: true }).then(({ id }) =>
        factoryManager.create('SpecialOffer', { categoryId: id }).then(() =>
          chai
            .request(server)
            .get(`/offer-app/offers?page=0&name=${text}`)
            .set('authorization', generateToken())
            .then(response => {
              expect(response.status).to.be.eql(200);
              expect(response.body.count).to.be.eql(2);
              expect(response.body.offers.length).to.be.eql(2);
              expect(response.body.offers[0].product.toLowerCase()).to.include(text);
              expect(response.body.offers[1].product.toLowerCase()).to.include(text);
              done();
            })
        )
      );
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
          expect(response.status).to.be.eql(200);
          expect(response.body.count).to.be.eql(0);
          expect(response.body.offers.length).to.be.eql(0);
          done();
        });
    });
  });

  it.skip('should be success get two offers', done => {
    Promise.all([factoryManager.create(factoryOffer), factoryManager.create(factoryOffer)]).then(() => {
      Promise.all([
        factoryManager.create(factoryCode, { email, offerId: 1 }),
        factoryManager.create(factoryCode, { email, offerId: 2 }),
        factoryManager.create(factoryUserOffer, { email, offerId: 1 }),
        factoryManager.create(factoryUserOffer, { email, offerId: 2 })
      ]).then(() => {
        chai
          .request(server)
          .get(`/offer-app/offers?page=0`)
          .set('authorization', generateToken())
          .then(response => {
            expect(response.status).to.be.eql(200);
            expect(response.body.count).to.be.eql(2);
            expect(response.body.offers.length).to.be.eql(2);
            done();
          });
      });
    });
  });

  it('should be success get no offers, because they are expired', done => {
    Promise.all([factoryManager.create('ExpiredOffer'), factoryManager.create('ExpiredOffer')]).then(() => {
      Promise.all([
        factoryManager.create(factoryCode, { email, offerId: 1 }),
        factoryManager.create(factoryCode, { email, offerId: 2 }),
        factoryManager.create(factoryUserOffer, { email, offerId: 1 }),
        factoryManager.create(factoryUserOffer, { email, offerId: 2 })
      ]).then(() => {
        chai
          .request(server)
          .get(`/offer-app/offers?page=0`)
          .set('authorization', generateToken())
          .then(response => {
            expect(response.status).to.be.eql(200);
            expect(response.body.count).to.be.eql(0);
            expect(response.body.offers.length).to.be.eql(0);
            done();
          });
      });
    });
  });

  it('should be success get no offers, because they not began', done => {
    Promise.all([factoryManager.create('NotBeganOffer'), factoryManager.create('NotBeganOffer')]).then(() => {
      Promise.all([
        factoryManager.create(factoryCode, { email, offerId: 1 }),
        factoryManager.create(factoryCode, { email, offerId: 2 }),
        factoryManager.create(factoryUserOffer, { email, offerId: 1 }),
        factoryManager.create(factoryUserOffer, { email, offerId: 2 })
      ]).then(() => {
        chai
          .request(server)
          .get(`/offer-app/offers?page=0`)
          .set('authorization', generateToken())
          .then(response => {
            expect(response.status).to.be.eql(200);
            expect(response.body.count).to.be.eql(0);
            expect(response.body.offers.length).to.be.eql(0);
            done();
          });
      });
    });
  });

  it('should be success get no offers, because they dont have redemptions left', done => {
    Promise.all([
      factoryManager.create('NoRedemptionsLeftOffer'),
      factoryManager.create('NoRedemptionsLeftOffer')
    ]).then(() => {
      Promise.all([
        factoryManager.create(factoryCode, { email, offerId: 1 }),
        factoryManager.create(factoryCode, { email, offerId: 2 }),
        factoryManager.create(factoryUserOffer, { email, offerId: 1 }),
        factoryManager.create(factoryUserOffer, { email, offerId: 2 })
      ]).then(() => {
        chai
          .request(server)
          .get(`/offer-app/offers?page=0`)
          .set('authorization', generateToken())
          .then(response => {
            expect(response.status).to.be.eql(200);
            expect(response.body.count).to.be.eql(0);
            expect(response.body.offers.length).to.be.eql(0);
            done();
          });
      });
    });
  });
  it('should be success get no offers, because they are out of stock', done => {
    factoryManager.create('ActiveOffer', { redemptions: 1, maxRedemptions: 1 }).then(() => {
      chai
        .request(server)
        .get(`/offer-app/offers?page=0`)
        .set('authorization', generateToken())
        .then(response => {
          expect(response.status).to.be.eql(200);
          expect(response.body.count).to.be.eql(0);
          expect(response.body.offers.length).to.be.eql(0);
          done();
        });
    });
  });

  it.skip('should be success get one offer', done => {
    const otherEmail = 'julian.molina+false@wolox.com.ar';
    Promise.all([factoryManager.create(factoryOffer), factoryManager.create(factoryOffer)]).then(() => {
      Promise.all([
        factoryManager.create(factoryCode, { email, offerId: 1 }),
        factoryManager.create(factoryCode, { email, offerId: 2 }),
        factoryManager.create(factoryUserOffer, { email, offerId: 1 }),
        factoryManager.create(factoryUserOffer, { email: otherEmail, offerId: 2 })
      ]).then(() => {
        chai
          .request(server)
          .get(`/offer-app/offers?page=0`)
          .set('authorization', generateToken())
          .then(response => {
            expect(response.status).to.be.eql(200);
            expect(response.body.count).to.be.eql(1);
            expect(response.body.offers.length).to.be.eql(1);
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
        expect(response.status).to.be.eql(200);
        expect(response.body.count).to.be.eql(0);
        expect(response.body.offers.length).to.be.eql(0);
        done();
      });
  });
  it('should be fail because getPoints does not work', done => {
    simple.restore();
    Promise.all([factoryManager.create(factoryOffer, { retail: 4635 })]).then(() =>
      Promise.all([factoryManager.create(factoryUserOffer, { email, offerId: 1 })]).then(() =>
        chai
          .request(server)
          .get(`/offer-app/offers`)
          .set('authorization', generateToken())
          .then(response => {
            expect(response.status).to.be.eql(500);
            expect(response.body).to.have.all.keys(expectedErrorKeys);
            expect(response.body.message).to.equal('Error when tried to obtain data from commerce');
            expect(response.body.internal_code).to.equal('default_error');
            done();
          })
      )
    );
  });
  it('should be success get offers with specials offers', done => {
    simple.mock(requestService, 'getPoints').resolveWith({
      address: 'Cochabamba 3254',
      reference: 'Next to McDonalds',
      commerce: { description: 'McDonalds', nit: '112233', imageUrl: '' },
      posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
    });
    factoryManager.create(factoryCategory, { special: true }).then(({ id }) =>
      factoryManager.create('ActiveOffer').then(() =>
        factoryManager.createMany('SpecialOffer', 4, { categoryId: id }).then(() =>
          factoryManager.create(factoryUserOffer, { email, offerId: 1 }).then(() => {
            chai
              .request(server)
              .get(`/offer-app/offers?`)
              .set('authorization', generateToken())
              .then(response => {
                expect(response.status).to.be.eql(200);
                expect(response.body.pages).to.be.eql(1);
                expect(response.body.count).to.be.eql(5);
                expect(response.body.offers.length).to.be.eql(5);
                done();
              });
          })
        )
      )
    );
  });
  it('should be success get special offers ', done => {
    simple.mock(requestService, 'getPoints').resolveWith({
      address: 'Cochabamba 3254',
      reference: 'Next to McDonalds',
      commerce: { description: 'McDonalds', nit: '112233', imageUrl: '' },
      posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
    });
    factoryManager.create(factoryCategory, { special: true }).then(({ id }) =>
      factoryManager.createMany('SpecialOffer', 4, { categoryId: id }).then(() =>
        factoryManager.create(factoryUserOffer, { email, offerId: 1 }).then(() => {
          chai
            .request(server)
            .get(`/offer-app/offers`)
            .set('authorization', generateToken())
            .then(response => {
              expect(response.status).to.be.eql(200);
              expect(response.body.pages).to.be.eql(1);
              expect(response.body.count).to.be.eql(4);
              expect(response.body.offers.length).to.be.eql(4);
              done();
            });
        })
      )
    );
  });
});

describe('/offer-app/codes GET', () => {
  it('should be success but the page was not sent', done => {
    chai
      .request(server)
      .get(`/offer-app/codes`)
      .set('authorization', generateToken())
      .then(response => {
        expect(response.status).to.be.eql(200);
        expect(response.body.codes.length).to.be.eql(0);
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
                  expect(response.status).to.be.eql(200);
                  expect(response.body.count).to.be.eql(2);
                  expect(response.body.codes.length).to.be.eql(2);
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
                  expect(response.status).to.be.eql(200);
                  expect(response.body.count).to.be.eql(1);
                  expect(response.body.codes.length).to.be.eql(1);
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
                  expect(response.status).to.be.eql(200);
                  expect(response.body.count).to.be.eql(1);
                  expect(response.body.codes.length).to.be.eql(1);
                  done();
                });
            });
        });
      });
    });
  });
  it('should be success get codes ordered', done => {
    Promise.all([
      factoryManager
        .create('ExpiredOffer')
        .then(off => factoryManager.create(factoryCode, { email, offerId: off.dataValues.id })),
      factoryManager
        .create('ActiveOffer')
        .then(off => factoryManager.create(factoryCode, { email, offerId: off.dataValues.id })),
      factoryManager
        .create('DisabledOffer', { date_inactive: moment().add(2, 'days') })
        .then(off => factoryManager.create(factoryCode, { email, offerId: off.dataValues.id })),
      factoryManager
        .create('ActiveOffer')
        .then(off =>
          factoryManager.create(factoryCode, { email, offerId: off.dataValues.id, dateRedemption: moment() })
        )
    ]).then(() =>
      chai
        .request(server)
        .get(`/offer-app/codes?page=0`)
        .set('authorization', generateToken())
        .then(response => {
          expect(response.status).to.be.eql(200);
          expect(response.body.count).to.be.eql(4);
          expect(response.body.pages).to.be.eql(1);
          expect(response.body.codes[0].status).to.be.eql(OFFER_ACTIVE);
          expect(response.body.codes[1].status).to.be.eql(OFFER_ACTIVE);
          expect(response.body.codes[1].dateRedemption).to.be.eql(moment().format('YYYY-MM-DD'));
          expect(response.body.codes[2].status).to.be.eql(OFFER_FINISHED);
          expect(response.body.codes[3].status).to.be.eql(OFFER_DISABLED);
          done();
        })
    );
  });
  it('should be success to get codes with offer out of stock', done => {
    factoryManager.create(factoryOffer, { redemptions: 1, maxRedemptions: 1 }).then(off =>
      Promise.all([
        factoryManager.create(factoryUserOffer, { email: 'julian.molina@wolox.com.ar', offerId: off.id }),
        factoryManager.create(factoryUserOffer, { email: 'julian.molina14@wolox.com.ar', offerId: off.id })
      ]).then(() =>
        factoryManager.create(factoryCode, { email: 'julian.molina@wolox.com.ar', offerId: 1 }).then(code =>
          factoryManager.create(factoryCode, { email: 'julian.molina14@wolox.com.ar', offerId: 1 }).then(() =>
            chai
              .request(server)
              .post(`/retail/11/code/${code.code}/redeem`)
              .set('authorization', generateToken())
              .then(() =>
                chai
                  .request(server)
                  .get(`/offer-app/codes?page=0`)
                  .set('authorization', generateToken('julian.molina14@wolox.com.ar'))
                  .then(res => {
                    expect(res.status).to.be.eql(200);
                    expect(res.body.codes[0].status).to.be.eql(OFFER_OUT_OF_STOCK);
                    done();
                  })
              )
          )
        )
      )
    );
  });
});
describe('/offer-app/offers/:id_offer GET', () => {
  it('should be success get a offer with code', done => {
    simple.mock(requestService, 'getPoints').resolveWith({
      address: 'Cochabamba 3254',
      reference: 'Next to McDonalds',
      commerce: { description: 'McDonalds', nit: '112233', imageUrl: '' },
      posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
    });
    let idOffer;
    factoryManager
      .create('ActiveOffer')
      .then(off => {
        idOffer = off.id;
        return factoryManager
          .create(factoryCode, { email, offerId: off.id })
          .then(() => factoryManager.create(factoryUserOffer, { email, offerId: off.id }));
      })
      .then(() =>
        chai
          .request(server)
          .get(`/offer-app/offers/${idOffer}`)
          .set('authorization', generateToken())
          .then(response => {
            expect(response.body.code).to.not.be.undefined;
            dictum.chai(response);
            done();
          })
      );
  });
  it('should be success get a offer without code', done => {
    simple.restore(requestService, 'getPoints');
    simple.mock(requestService, 'getPoints').resolveWith({
      address: 'Cochabamba 3254',
      reference: 'Next to McDonalds',
      commerce: { description: 'McDonalds', nit: '112233', imageUrl: '' },
      posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
    });
    factoryManager.create('ActiveOffer').then(off =>
      factoryManager.create(factoryUserOffer, { email, offerId: 1 }).then(() =>
        chai
          .request(server)
          .get(`/offer-app/offers/${off.id}`)
          .set('authorization', generateToken())
          .then(response => {
            expect(response.status).to.be.eql(200);
            expect(response.body.code).to.be.undefined;
            done();
          })
      )
    );
  });
  it('Should be fail because the offer does not exist', done => {
    factoryManager.create(factoryOffer).then(off =>
      chai
        .request(server)
        .get(`/offer-app/offers/1236784`)
        .set('authorization', generateToken())
        .then(err => {
          expect(err.body).to.have.all.keys(expectedErrorKeys);
          expect(err.body.message).to.equal('Offer Not Found');
          expect(err.body.internal_code).to.equal('offer_not_found');
          done();
        })
    );
  });
});
describe('/offers-public/users POST', () => {
  it('should be success when the user exist', done => {
    simple.mock(cognitoService.cognito, 'adminGetUser').returnWith({
      promise: () => Promise.resolve()
    });
    chai
      .request(server)
      .post(`/offers-public/users`)
      .send({ email })
      .set('authorization', generateToken())
      .then(response => {
        expect(response.status).to.be.eql(200);
        expect(response.body.exist).to.be.true;
        dictum.chai(response);
        simple.restore(cognitoService.cognito, 'adminGetUser');
        done();
      });
  });
  it('should be success when the user does not exist', done => {
    simple.mock(cognitoService.cognito, 'adminGetUser').returnWith({
      promise: () => Promise.reject({ code: 'UserNotFoundException' })
    });
    chai
      .request(server)
      .post(`/offers-public/users`)
      .send({ email })
      .set('authorization', generateToken())
      .then(response => {
        expect(response.status).to.be.eql(200);
        expect(response.body.exist).to.be.false;
        simple.restore(cognitoService.cognito, 'adminGetUser');
        done();
      });
  });
  it('should be fail because an error ocurred in cognito', done => {
    simple.mock(cognitoService.cognito, 'adminGetUser').returnWith({
      promise: () => Promise.reject({ code: 'InternalErrorException' })
    });
    chai
      .request(server)
      .post(`/offers-public/users`)
      .send({ email })
      .set('authorization', generateToken())
      .then(err => {
        expect(err.body).to.have.all.keys(expectedErrorKeys);
        expect(err.body.message).to.equal('InternalErrorException');
        expect(err.body.internal_code).to.equal('bad_request');
        done();
      });
  });
  it('should be fail because does not send email', done => {
    chai
      .request(server)
      .post(`/offers-public/users`)
      .set('authorization', generateToken())
      .then(err => {
        expect(err.body).to.have.all.keys(expectedErrorKeys);
        expect(err.body.message).to.include('The email is required');
        expect(err.body.internal_code).to.equal('bad_request');
        done();
      });
  });
  describe('/offer-app/login GET', () => {
    it('should be success first login', done => {
      simple.mock(cognitoService.cognito, 'adminUpdateUserAttributes').returnWith({
        promise: () => Promise.resolve()
      });
      chai
        .request(server)
        .put(`/offer-app/login`)
        .set('authorization', generateToken())
        .then(response => {
          expect(response.status).to.be.eql(200);
          dictum.chai(response);
          done();
        });
    });
    it('should be fail because fail cognito', done => {
      simple.mock(cognitoService.cognito, 'adminUpdateUserAttributes').returnWith({
        promise: () => Promise.reject({ code: 'AliasExistsException' })
      });
      chai
        .request(server)
        .put(`/offer-app/login`)
        .set('authorization', generateToken())
        .then(err => {
          expect(err.status).to.be.eql(400);
          expect(err.body.message).to.be.eqls('AliasExistsException');
          expect(err.body.internal_code).to.be.eqls('bad_request');
          done();
        });
    });
  });
});
