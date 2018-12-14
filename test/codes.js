const chai = require('chai'),
  expect = chai.expect,
  dictum = require('dictum.js'),
  server = require('./../app'),
  moment = require('moment'),
  requestService = require('../app/services/request'),
  Offer = require('../app/models').offer,
  Code = require('../app/models').code,
  mailer = require('../app/services/mailer'),
  simple = require('simple-mock'),
  { OFFER_OUT_OF_STOCK, OFFER_EXPIRED } = require('../app/constants'),
  token = require('../test/factories/token'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryCategory = require('../test/factories/category').nameFactory,
  factoryTypeOffer = require('../test/factories/typeOffer').nameFactory,
  factoryOffer = require('../test/factories/offer').nameFactory,
  factoryUserOffer = require('../test/factories/userOffer').nameFactory,
  i18next = require('i18next'),
  expectedErrorKeys = ['message', 'internal_code'],
  factoryCode = require('../test/factories/code').nameFactory;

const offerWithRetail = {
  product: '2x1 en McDuo',
  begin: '2017-02-13',
  expiration: moment().format('YYYY-MM-DD'),
  category: 1,
  strategy: 1,
  codes: 0,
  valueStrategy: '30%',
  maxRedemptions: 1200,
  purpose: 'Atraer clientes',
  extension: 'jpg'
};
describe('/offers/:id/code POST', () => {
  offerWithRetail.retail = 1222;
  beforeEach(() => {
    simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
      callback(undefined, true);
    });
    simple.mock(requestService, 'getPoints').resolveWith({
      address: 'Cochabamba 3254',
      reference: 'Next to McDonalds',
      commerce: { description: 'McDonalds', nit: 1234 },
      posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
    });
  });
  it('should be successful', done => {
    Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }),
      factoryManager.create(factoryOffer, { retail: 1222 })
    ]).then(() =>
      factoryManager.create(factoryUserOffer, { offerId: 1 }).then(newEmailUser =>
        chai
          .request(server)
          .post(`/offers/1/code`)
          .send({ email: newEmailUser.hashEmail })
          .then(json => {
            expect(json.status).to.be.eql(201);
            Offer.getBy({ id: 1 }).then(after => {
              expect(after.codes).to.be.eql(1);
            });
            expect(mailer.transporter.sendMail.lastCall.args[0].subject).to.be.eql(
              i18next.t(`newCode.subject`)
            );
            expect(mailer.transporter.sendMail.lastCall.args[0].to).to.be.eql(newEmailUser.email);
            dictum.chai(json);
            done();
          })
      )
    );
  });
  it('should be fail because the offer expired', done => {
    offerWithRetail.expiration = moment()
      .subtract(2, 'days')
      .format('YYYY-MM-DD');
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer, offerWithRetail).then(before => {
          factoryManager
            .create(factoryUserOffer, {
              email: 'julian.molina@wolox.com.ar',
              offer_id: before.id
            })
            .then(newEmailUser => {
              chai
                .request(server)
                .post(`/offers/${before.id}/code`)
                .send({ email: newEmailUser.hashEmail })
                .then(json => {
                  expect(json.status).to.be.eql(400);
                  expect(json).to.be.json;
                  expect(json.body).to.have.all.keys(expectedErrorKeys);
                  expect(json.body.internal_code).to.be.eql('offer_expire');
                  expect(mailer.transporter.sendMail.lastCall.args[0].subject).to.be.eql(
                    i18next.t(`finished.subject`)
                  );
                  expect(mailer.transporter.sendMail.lastCall.args[0].to).to.be.eql(
                    'julian.molina@wolox.com.ar'
                  );
                  done();
                });
            });
        });
      });
    });
  });
  it('should be fail because the offer does not exist', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        chai
          .request(server)
          .post(`/offers/23/code`)
          .send({ email: 'julian.molina@wolox.com.ar' })
          .then(json => {
            expect(json.status).to.be.eql(404);
            expect(json).to.be.json;
            expect(json.body).to.have.all.keys(expectedErrorKeys);
            expect(json.body.internal_code).to.be.eql('offer_not_found');
            done();
          });
      });
    });
  });
  it('should be fail because already exist code for email', done => {
    Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }),
      factoryManager.create(factoryOffer, { retail: 1222 })
    ]).then(() =>
      factoryManager.create(factoryCode, { email: 'julian.molina@wolox.com.ar', offerId: 1 }).then(() =>
        factoryManager
          .create(factoryUserOffer, { email: 'julian.molina@wolox.com.ar', offerId: 1 })
          .then(newEmailUser =>
            chai
              .request(server)
              .post(`/offers/1/code`)
              .send({ email: newEmailUser.hashEmail })
              .then(json => {
                expect(json.status).to.be.eql(400);
                expect(json).to.be.json;
                expect(json.body).to.have.all.keys(expectedErrorKeys);
                expect(json.body.internal_code).to.be.eql('existing_mail');
                done();
              })
          )
      )
    );
  });
  it('should be fail because the offer was disabled', done => {
    Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }),
      factoryManager.create(factoryOffer, { retail: 1222, active: false })
    ]).then(() =>
      factoryManager
        .create(factoryUserOffer, { email: 'julian.molina@wolox.com.ar', offerId: 1 })
        .then(newEmailUser =>
          chai
            .request(server)
            .post(`/offers/1/code`)
            .send({ email: newEmailUser.hashEmail })
            .then(json => {
              expect(json.status).to.be.eql(400);
              expect(json).to.be.json;
              expect(json.body).to.have.all.keys(expectedErrorKeys);
              expect(json.body.internal_code).to.be.eql('offer_disabled');
              done();
            })
        )
    );
  });
  it('should be fail because the user does not exist', done => {
    Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }),
      factoryManager.create('ActiveOffer', { retail: 1222 })
    ]).then(() =>
      Promise.all([
        factoryManager.create(factoryUserOffer, { email: 'julian.molina@wolox.com.ar', offerId: 1 })
      ]).then(() =>
        chai
          .request(server)
          .post(`/offers/1/code`)
          .send({ email: 'hash400' })
          .then(json => {
            expect(json.status).to.be.eql(404);
            expect(json).to.be.json;
            expect(json.body).to.have.all.keys(expectedErrorKeys);
            expect(json.body.internal_code).to.be.eql('user_not_found');
            done();
          })
      )
    );
  });
  it('should be fail because getPoints does not work', done => {
    simple.restore(requestService, 'getPoints');
    Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }),
      factoryManager.create(factoryOffer, { retail: 1222 })
    ]).then(() =>
      factoryManager.create(factoryUserOffer, { offerId: 1 }).then(newEmailUser =>
        chai
          .request(server)
          .post(`/offers/1/code`)
          .send({ email: newEmailUser.hashEmail })
          .then(json => {
            expect(json.status).to.be.eql(201);
            Offer.getBy({ id: 1 }).then(after => {
              expect(after.codes).to.be.eql(1);
            });
            expect(mailer.transporter.sendMail.lastCall.args[0].subject).to.be.equal(
              i18next.t(`newCode.subject`)
            );
            expect(mailer.transporter.sendMail.lastCall.args[0].to).to.be.equal(newEmailUser.email);
            done();
          })
      )
    );
  });
});

const generateToken = (points = '11') => `bearer ${token.generate({ points })}`;
describe('/retail/:id/code/:code/redeem PATCH', () => {
  it('should success redeem of code', done => {
    factoryManager.create(factoryCode).then(code => {
      chai
        .request(server)
        .patch(`/retail/11/code/${code.code}/redeem`)
        .set('authorization', generateToken())
        .then(response => {
          expect(response.status).to.be.eql(200);
          dictum.chai(response);
          done();
        });
    });
  });
  it('should fail redeem of code because not exist', done => {
    factoryManager.create(factoryCode).then(code => {
      chai
        .request(server)
        .patch(`/retail/11/code/12333/redeem`)
        .set('authorization', generateToken())
        .then(err => {
          expect(err.status).to.be.eql(404);
          expect(err.body).to.have.all.keys(expectedErrorKeys);
          expect(err.body.internal_code).to.be.eql('code_not_found');
          done();
        });
    });
  });
  it('should fail redeem of code because user is not authorized', done => {
    factoryManager.create(factoryCode).then(code => {
      chai
        .request(server)
        .patch(`/retail/122/code/12333/redeem`)
        .set('authorization', generateToken())
        .then(err => {
          expect(err.status).to.be.eql(401);
          expect(err.body).to.have.all.keys(expectedErrorKeys);
          expect(err.body.internal_code).to.be.eql('user_unauthorized');
          done();
        });
    });
  });
  it('should fail redeem of code because is already redeemed', done => {
    factoryManager.create(factoryCode, { dateRedemption: moment() }).then(code => {
      chai
        .request(server)
        .patch(`/retail/11/code/${code.code}/redeem`)
        .set('authorization', generateToken())
        .then(err => {
          expect(err.status).to.be.eql(400);
          expect(err.body).to.have.all.keys(expectedErrorKeys);
          expect(err.body.internal_code).to.be.eql('code_redeemed');
          done();
        });
    });
  });
  it('should fail redeem of code because is offer is inactive (future)', done => {
    factoryManager
      .create(factoryOffer, { expiration: moment().add(10, 'day'), begin: moment().add(9, 'day') })
      .then(offer =>
        factoryManager.create(factoryCode, { offerId: offer.id }).then(code => {
          chai
            .request(server)
            .patch(`/retail/11/code/${code.code}/redeem`)
            .set('authorization', generateToken())
            .then(err => {
              expect(err.status).to.be.eql(400);
              expect(err.body).to.have.all.keys(expectedErrorKeys);
              expect(err.body.internal_code).to.be.eql('offer_inactive');
              done();
            });
        })
      );
  });
  it('should fail redeem of code because offer was disabled', done => {
    factoryManager.create(factoryOffer, { retail: 11, active: false }).then(offer =>
      factoryManager.create(factoryCode, { offerId: offer.id }).then(code => {
        chai
          .request(server)
          .patch(`/retail/11/code/${code.code}/redeem`)
          .set('authorization', generateToken())
          .then(err => {
            expect(err.status).to.be.eql(400);
            expect(err.body).to.have.all.keys(expectedErrorKeys);
            expect(err.body.internal_code).to.be.eql('offer_disabled');
            done();
          });
      })
    );
  });
});

describe('/retail/:id/code/:code GET', () => {
  it('should success get of code', done => {
    factoryManager.create(factoryCode, { email: 'julian.molina@wolox.com.ar' }).then(code => {
      chai
        .request(server)
        .get(`/retail/11/code/${code.code}`)
        .set('authorization', generateToken())
        .then(response => {
          expect(response.status).to.be.eql(200);
          expect(response.body).to.have.all.keys([
            'image',
            'email',
            'code',
            'dateRedemption',
            'status',
            'product'
          ]);
          expect(response.body.email).to.be.eql('jul****@wol****');
          dictum.chai(response);
          done();
        });
    });
  });
  it('should be success to get code with offer out of stock', done => {
    factoryManager.create(factoryOffer, { redemptions: 1, maxRedemptions: 1 }).then(off =>
      Promise.all([
        factoryManager.create(factoryUserOffer, { email: 'julian.molina@wolox.com.ar', offerId: off.id }),
        factoryManager.create(factoryUserOffer, { email: 'julian.molina14@wolox.com.ar', offerId: off.id })
      ]).then(() =>
        factoryManager.create(factoryCode, { email: 'julian.molina@wolox.com.ar', offerId: 1 }).then(code =>
          factoryManager
            .create(factoryCode, { email: 'julian.molina14@wolox.com.ar', offerId: 1 })
            .then(codeOutOfStock =>
              chai
                .request(server)
                .post(`/retail/11/code/${code.code}/redeem`)
                .set('authorization', generateToken())
                .then(() =>
                  chai
                    .request(server)
                    .get(`/retail/11/code/${codeOutOfStock.code}`)
                    .set('authorization', generateToken())
                    .then(res => {
                      expect(res.status).to.be.eql(200);
                      expect(res.body.status).to.be.eql(OFFER_OUT_OF_STOCK);
                      done();
                    })
                )
            )
        )
      )
    );
  });
  it('should fail get of code because not exist', done => {
    chai
      .request(server)
      .get(`/retail/11/code/11`)
      .set('authorization', generateToken())
      .then(err => {
        expect(err.status).to.be.eql(404);
        expect(err.body).to.have.all.keys(expectedErrorKeys);
        expect(err.body.internal_code).to.be.eql('code_not_found');
        done();
      });
  });
  it('should fail get of code because user is unauthorized', done => {
    chai
      .request(server)
      .get(`/retail/112/code/11`)
      .set('authorization', generateToken())
      .then(err => {
        expect(err.status).to.be.eql(401);
        expect(err.body).to.have.all.keys(expectedErrorKeys);
        expect(err.body.internal_code).to.be.eql('user_unauthorized');
        done();
      });
  });
});
describe('/offer-app/offers/:id/code POST', () => {
  const generateTokenApp = (email = 'julian.molina@wolox.com.ar') =>
    `bearer ${token.generate({ email, points: '11' })}`;
  it('should be success to create a code', done => {
    factoryManager.create(factoryOffer).then(off =>
      factoryManager
        .create(factoryUserOffer, { email: 'julian.molina@wolox.com.ar', offerId: off.id })
        .then(() =>
          chai
            .request(server)
            .post(`/offer-app/offers/${off.id}/code`)
            .set('authorization', generateTokenApp())
            .then(response => {
              expect(response.status).to.be.eql(201);
              Offer.getBy({ id: 1 }).then(after => {
                expect(after.codes).to.be.eql(1);
              });
              expect(response.body).to.have.all.keys(['product', 'valueStrategy', 'expires', 'code']);
              done();
            })
        )
    );
  });
  it('should fail because the offer doesnt exist', done => {
    factoryManager.create(factoryOffer).then(off =>
      chai
        .request(server)
        .post(`/offer-app/offers/1345/code`)
        .set('authorization', generateTokenApp())
        .then(err => {
          expect(err.status).to.be.eql(404);
          expect(err.body).to.have.all.keys(expectedErrorKeys);
          done();
        })
    );
  });
  it.skip('should fail because the user try to create a code for a another different user offer', done => {
    factoryManager.create(factoryOffer).then(off =>
      factoryManager.create(factoryUserOffer, { email: 'domain@fake.com.ar', offerId: off.id }).then(() =>
        chai
          .request(server)
          .post(`/offer-app/offers/1/code`)
          .set('authorization', generateTokenApp())
          .then(err => {
            expect(err.status).to.be.eql(404);
            expect(err.body).to.have.all.keys(expectedErrorKeys);
            done();
          })
      )
    );
  });
});
