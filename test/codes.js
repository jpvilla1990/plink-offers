const chai = require('chai'),
  expect = chai.expect,
  dictum = require('dictum.js'),
  server = require('./../app'),
  moment = require('moment'),
  requestService = require('../app/services/request'),
  Offer = require('../app/models').offer,
  mailer = require('../app/services/mailer'),
  simple = require('simple-mock'),
  token = require('../test/factories/token'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryCategory = require('../test/factories/category').nameFactory,
  factoryTypeOffer = require('../test/factories/typeOffer').nameFactory,
  factoryOffer = require('../test/factories/offer').nameFactory,
  i18next = require('i18next'),
  logger = require('../app/logger'),
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
    simple
      .mock(requestService, 'retail')
      .resolveWith({ addres: 'Cochabamba 3254', commerce: { description: 'McDonalds' } });
  });
  it('should be successful', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager
          .create(factoryOffer, { strategy: r.dataValues.id, category: rv.dataValues.id, retail: 1222 })
          .then(before => {
            chai
              .request(server)
              .post(`/offers/${before.id}/code`)
              .send({ email: 'julian.molina@wolox.com.ar' })
              .then(json => {
                json.should.have.status(201);
                Offer.getBy({ id: before.id }).then(after => {
                  after.codes.should.eqls(1);
                });
                mailer.transporter.sendMail.lastCall.args[0].subject.should.equal(
                  i18next.t(`newCode.subject`)
                );
                mailer.transporter.sendMail.lastCall.args[0].to.should.equal('julian.molina@wolox.com.ar');
                dictum.chai(json);
                done();
              });
          });
      });
    });
  });
  it('should be fail because the offer expired', done => {
    offerWithRetail.expiration = moment()
      .subtract(2, 'days')
      .format('YYYY-MM-DD');
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer, offerWithRetail).then(before => {
          chai
            .request(server)
            .post(`/offers/${before.id}/code`)
            .send({ email: 'julian.molina@wolox.com.ar' })
            .then(json => {
              json.should.have.status(400);
              json.should.be.json;
              json.body.should.have.property('message');
              json.body.should.have.property('internal_code');
              json.body.internal_code.should.be.equal('offer_inactive');
              mailer.transporter.sendMail.lastCall.args[0].subject.should.eqls(
                i18next.t(`offerExpired.subject`)
              );
              mailer.transporter.sendMail.lastCall.args[0].to.should.eqls('julian.molina@wolox.com.ar');
              done();
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
            json.should.have.status(404);
            json.should.be.json;
            json.body.should.have.property('message');
            json.body.should.have.property('internal_code');
            json.body.internal_code.should.be.equal('offer_not_found');
            done();
          });
      });
    });
  });
  it('should be fail because already exist code for email', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer).then(before => {
          factoryManager
            .create(factoryCode, { email: 'julian.molina@wolox.com.ar', offerId: before.dataValues.id })
            .then(() => {
              chai
                .request(server)
                .post(`/offers/${before.dataValues.id}/code`)
                .send({ email: 'julian.molina@wolox.com.ar' })
                .then(json => {
                  json.should.have.status(400);
                  json.should.be.json;
                  json.body.should.have.property('message');
                  json.body.should.have.property('internal_code');
                  json.body.internal_code.should.be.equal('existing_mail');
                  done();
                });
            });
        });
      });
    });
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
          response.should.have.status(200);
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
        .then(res => {
          res.should.have.status(404);
          res.body.should.have.property('internal_code');
          res.body.should.have.property('message');
          res.body.internal_code.should.be.equal('code_not_found');
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
        .then(res => {
          res.should.have.status(401);
          res.body.should.have.property('internal_code');
          res.body.should.have.property('message');
          res.body.internal_code.should.be.equal('user_unauthorized');
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
        .then(response => {
          response.should.have.status(400);
          response.body.should.have.property('internal_code');
          response.body.should.have.property('message');
          response.body.internal_code.should.be.equal('code_redeemed');
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
            .then(response => {
              response.should.have.status(400);
              response.body.should.have.property('internal_code');
              response.body.should.have.property('message');
              response.body.internal_code.should.be.equal('offer_inactive');
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
          response.should.have.status(200);
          expect(response.body).to.have.all.keys([
            'image',
            'email',
            'code',
            'dateRedemption',
            'status',
            'product'
          ]);
          response.body.email.should.eqls('juli*******@****x.com.ar');
          dictum.chai(response);
          done();
        });
    });
  });
  it('should fail get of code because not exist', done => {
    chai
      .request(server)
      .get(`/retail/11/code/11`)
      .set('authorization', generateToken())
      .then(response => {
        response.body.should.have.property('internal_code');
        response.body.should.have.property('message');
        response.body.internal_code.should.be.equal('code_not_found');
        response.should.have.status(404);
        done();
      });
  });
  it('should fail get of code because user is unauthorized', done => {
    chai
      .request(server)
      .get(`/retail/112/code/11`)
      .set('authorization', generateToken())
      .then(response => {
        response.body.should.have.property('internal_code');
        response.body.should.have.property('message');
        response.body.internal_code.should.be.equal('user_unauthorized');
        response.should.have.status(401);
        done();
      });
  });
});
describe('/offer-app/offers/:id/code POST', () => {
  const generateTokenApp = (email = 'julian.molina@wolox.com.ar') => `bearer ${token.generate({ email })}`;
  it('should success', done => {
    factoryManager.create(factoryOffer).then(off =>
      chai
        .request(server)
        .post(`/offer-app/offers/${off.dataValues.id}/code`)
        .set('authorization', generateTokenApp())
        .then(response => {
          response.should.have.status(201);
          expect(response.body).to.have.all.keys(['product', 'valueStrategy', 'expires', 'code']);
          done();
        })
    );
  });
  it('should fail because the offer doesnt exist', done => {
    factoryManager.create(factoryOffer).then(off =>
      chai
        .request(server)
        .post(`/offer-app/offers/1345/code`)
        .set('authorization', generateTokenApp())
        .then(response => {
          response.should.have.status(404);
          response.body.should.have.property('internal_code');
          response.body.should.have.property('message');
          done();
        })
    );
  });
});
