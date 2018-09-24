const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  logger = require('../app/logger'),
  config = require('../config'),
  utils = require('../app/utils'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryCategory = require('../test/factories/category').nameFactory,
  factoryTypeOffer = require('../test/factories/typeOffer').nameFactory,
  factoryOffer = require('../test/factories/offer').nameFactory,
  factoryCode = require('../test/factories/code').nameFactory,
  factoryEmailUser = require('../test/factories/emailUser').nameFactory,
  requestService = require('../app/services/request'),
  rollbarService = require('../app/services/rollbar'),
  simple = require('simple-mock'),
  token = require('./factories/token'),
  jobNotify = require('../app/jobs/notify'),
  mailer = require('../app/services/mailer'),
  headerName = config.common.session.header_name,
  Offer = require('../app/models').offer,
  EmailUser = require('../app/models').email_user,
  { OFFER_ACTIVE, OFFER_INACTIVE, OFFER_DISABLED, OFFER_FINISHED } = require('../app/constants'),
  ZendeskService = require('../app/services/zendesk'),
  should = chai.should(),
  expect = chai.expect,
  offerExample = {
    product: '2x1 en McDuo',
    begin: '2017-02-13',
    expiration: '2017-05-24',
    category: 1,
    strategy: 1,
    valueStrategy: '30%',
    maxRedemptions: 1200,
    purpose: 'Atraer clientes',
    url: 'https://s3.amazonaws.com/plink-email-assets/plink_offers/bg_general.png'
  },
  offerWithoutProduct = {
    begin: '2017-02-13',
    expiration: '2017-05-24',
    category: 1,
    strategy: 1,
    valueStrategy: '30%',
    maxRedemptions: 1200,
    purpose: 'Atraer clientes',
    url: 'https://s3.amazonaws.com/plink-email-assets/plink_offers/bg_general.png'
  },
  offerWithCategoryWrong = {
    product: '2x1 en McDuo',
    begin: '2017-02-13',
    expiration: '2017-05-24',
    category: 'travel',
    strategy: 1,
    valueStrategy: '30%',
    maxRedemptions: 1200,
    purpose: 'Atraer clientes',
    url: 'https://s3.amazonaws.com/plink-email-assets/plink_offers/bg_general.png'
  },
  tokenExample = `test ${token.generate({ points: '1222,1444,1333' })}`;

describe('/retail/:id/offers POST', () => {
  const offerWithRetail = offerExample;
  offerWithRetail.retail = 1222;
  beforeEach(() => {
    simple.mock(requestService, 'getPoints').resolveWith({
      address: 'Cochabamba 3254',
      commerce: { description: 'McDonalds', nit: 1234 },
      posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
    });
    simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
      callback(undefined, true);
    });
    simple.mock(ZendeskService, 'findGroupId').resolveWith(Promise.resolve(1234));
    simple.mock(ZendeskService, 'postTicket').resolveWith(Promise.resolve());
  });
  it('should be successful', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        chai
          .request(server)
          .post('/retail/1222/offers')
          .set(headerName, tokenExample)
          .send(offerExample)
          .then(res => {
            res.should.have.status(201);
            Offer.getBy({ retail: 1222 }).then(exist => {
              const off = !!exist;
              off.should.eql(true);
              dictum.chai(res);
              done();
            });
          });
      });
    });
  });
  it('should be fail because category isnt string', done => {
    chai
      .request(server)
      .post('/retail/1222/offers')
      .set(headerName, tokenExample)
      .send(offerWithCategoryWrong)
      .then(res => {
        res.should.have.status(400);
        res.body.should.have.property('message');
        res.body.should.have.property('internal_code');
        done();
      });
  });
  it('should be fail because didnt sent product', done => {
    chai
      .request(server)
      .post('/retail/1222/offers')
      .set(headerName, tokenExample)
      .send(offerWithoutProduct)
      .then(err => {
        err.should.have.status(400);
        err.body.should.have.property('message');
        err.body.should.have.property('internal_code');
        done();
      });
  });
  it('should be successful but zendesk fail', done => {
    simple.restore(ZendeskService, 'findGroupId');
    simple.restore(ZendeskService, 'postTicket');
    simple
      .mock(ZendeskService, 'findGroupId')
      .rejectWith({ internalCode: 'group_id_not_found', message: 'Group id for zendesk not found' });
    simple.mock(rollbarService, 'error').returnWith({});
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        chai
          .request(server)
          .post('/retail/1222/offers')
          .set(headerName, tokenExample)
          .send(offerExample)
          .then(res => {
            res.should.have.status(201);
            Offer.getBy({ id: 1 }).then(exist => {
              const off = !!exist;
              off.should.eql(true);
              rollbarService.error.callCount.should.eqls(1);
              done();
            });
          });
      });
    });
  });
});

describe('/retail/:id/offers GET', () => {
  it('should be successful with one page and with limit', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer, offerExample).then(off => {
          chai
            .request(server)
            .get('/retail/1222/offers?page=0')
            .set(headerName, tokenExample)
            .then(res => {
              res.should.have.status(200);
              res.body.should.have.property('count');
              res.body.should.have.property('offers');
              res.body.offers.length.should.eql(1);
              dictum.chai(res);
              done();
            });
        });
      });
    });
  });
  it('should be successful  with one page but without limit', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer, offerExample).then(off => {
          chai
            .request(server)
            .get('/retail/1222/offers?page=0')
            .set(headerName, tokenExample)
            .then(res => {
              res.should.have.status(200);
              res.body.should.have.property('count');
              res.body.should.have.property('offers');
              res.body.offers.length.should.eql(1);
              done();
            });
        });
      });
    });
  });
  it('should be successful with offers ordered', done => {
    Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }),
      factoryManager.create(factoryOffer, { product: 'first', retail: 1222 })
    ])
      .then()
      .then(() =>
        setTimeout(
          () =>
            factoryManager.create(factoryOffer, { product: 'second', retail: 1222 }).then(() => {
              chai
                .request(server)
                .get('/retail/1222/offers?page=0')
                .set(headerName, tokenExample)
                .then(res => {
                  res.should.have.status(200);
                  res.body.should.have.property('count');
                  res.body.should.have.property('offers');
                  res.body.offers[0].product.should.eql('second');
                  done();
                });
            }),
          1000
        )
      );
  });
  it('should be fail because in the query doesnt exist page', done => {
    chai
      .request(server)
      .get('/retail/1222/offers?')
      .set(headerName, tokenExample)
      .then(res => {
        res.should.have.status(200);
        res.body.offers.length.should.eqls(0);
        done();
      });
  });

  it('should be successful with not began offer (inactive)', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create('NotBeganOffer').then(off => {
          chai
            .request(server)
            .get('/retail/1222/offers?page=0')
            .set(headerName, tokenExample)
            .then(res => {
              res.should.have.status(200);
              res.body.should.have.property('count');
              res.body.should.have.property('offers');
              res.body.offers.length.should.eql(1);
              res.body.offers[0].should.have.property('status');
              res.body.offers[0].status.should.equal(OFFER_INACTIVE);
              dictum.chai(res);
              done();
            });
        });
      });
    });
  });

  it('should be successful with one active offer (active)', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create('ActiveOffer').then(off => {
          chai
            .request(server)
            .get('/retail/1222/offers?page=0')
            .set(headerName, tokenExample)
            .then(res => {
              res.should.have.status(200);
              res.body.should.have.property('count');
              res.body.should.have.property('offers');
              res.body.offers.length.should.eql(1);
              res.body.offers[0].should.have.property('status');
              res.body.offers[0].status.should.equal(OFFER_ACTIVE);
              dictum.chai(res);
              done();
            });
        });
      });
    });
  });

  it('should be successful with one expired offer (finished)', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create('ExpiredOffer').then(off => {
          chai
            .request(server)
            .get('/retail/1222/offers?page=0')
            .set(headerName, tokenExample)
            .then(res => {
              res.should.have.status(200);
              res.body.should.have.property('count');
              res.body.should.have.property('offers');
              res.body.offers.length.should.eql(1);
              res.body.offers[0].should.have.property('status');
              res.body.offers[0].status.should.equal(OFFER_FINISHED);
              dictum.chai(res);
              done();
            });
        });
      });
    });
  });
});

it('should be successful with one disabled offer (disabled)', done => {
  factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
    factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
      factoryManager.create('DisabledOffer').then(off => {
        chai
          .request(server)
          .get('/retail/1222/offers?page=0')
          .set(headerName, tokenExample)
          .then(res => {
            res.should.have.status(200);
            res.body.should.have.property('count');
            res.body.should.have.property('offers');
            res.body.offers.length.should.eql(1);
            res.body.offers[0].should.have.property('status');
            res.body.offers[0].status.should.equal(OFFER_DISABLED);
            dictum.chai(res);
            done();
          });
      });
    });
  });
});

describe('job notify', () => {
  let warning;
  beforeEach(() =>
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv =>
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r =>
        factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id }).then(off => {
          simple.mock(jobNotify.sqs, 'receiveMessage').returnWith({
            promise: () =>
              Promise.resolve({
                Messages: [
                  {
                    Attributes: { MessageDeduplicationId: off.id },
                    Body:
                      '{"mails":[{"mail":"julian.molina@wolox.com.ar","name":"julian"},{"mail":"julian.molina@wolox.com.ar","name":"julian"},{"mail":"julian.molina@wolox.com.ar","name":"julian"}]}'
                  }
                ]
              })
          });
          simple.mock(jobNotify.ses, 'getSendQuota').callFn((obj, callback) => {
            callback(undefined, {
              Max24HourSend: 2,
              SentLast24Hours: 1
            });
          });
          simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
            callback(undefined, true);
          });
          warning = simple.mock(logger.warn);
        })
      )
    )
  );
  it('should be fail because the count of mail es grather than Daily quota limit ', done => {
    jobNotify.notify().then(() => {
      mailer.transporter.sendMail.callCount.should.eqls(0);
      done();
    });
  });

  it('Should not send email, due to offer is expired', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create('DisabledOffer').then(off => {
          simple.mock(jobNotify.sqs, 'receiveMessage').returnWith({
            promise: () =>
              Promise.resolve({
                Messages: [
                  {
                    Attributes: { MessageDeduplicationId: off.id },
                    Body: '{"mails":[{"mail":"julian.molina@wolox.com.ar","name":"julian"}]}'
                  }
                ]
              })
          });
          simple.restore(jobNotify.ses, 'getSendQuota');
          simple.mock(jobNotify.sqs, 'deleteMessage').returnWith({
            promise: () => Promise.resolve({})
          });
          simple.mock(jobNotify.ses, 'getSendQuota').callFn((obj, callback) => {
            callback(undefined, {
              Max24HourSend: 50,
              SentLast24Hours: 1
            });
          });
          simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
            callback(undefined, true);
          });
          warning = simple.mock(logger.warn);

          jobNotify.notify().then(() => {
            mailer.transporter.sendMail.callCount.should.eqls(0);
            done();
          });
        });
      });
    });
  });

  it('should be successful ', done => {
    simple.mock(jobNotify.sqs, 'receiveMessage').returnWith({
      promise: () =>
        Promise.resolve({
          Messages: [
            {
              Attributes: { MessageDeduplicationId: 1 },
              Body: '{"mails":[{"mail":"julian.molina@wolox.com.ar","name":"julian"}]}'
            }
          ]
        })
    });
    simple.restore(jobNotify.ses, 'getSendQuota');
    simple.mock(jobNotify.ses, 'getSendQuota').callFn((obj, callback) => {
      callback(undefined, {
        Max24HourSend: 50,
        SentLast24Hours: 1
      });
    });
    simple.mock(jobNotify.sqs, 'deleteMessage').returnWith({
      promise: () => Promise.resolve({})
    });
    simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
      callback(undefined, true);
    });
    jobNotify.notify().then(() => {
      setTimeout(() => {
        mailer.transporter.sendMail.callCount.should.eqls(1);
        done();
      }, 2000);
    });
  });
  it('should be successful but the user already exist ', done => {
    simple.mock(jobNotify.sqs, 'receiveMessage').returnWith({
      promise: () =>
        Promise.resolve({
          Messages: [
            {
              Attributes: { MessageDeduplicationId: 1 },
              Body: '{"mails":[{"mail":"julian.molina@wolox.com.ar","name":"julian"}]}'
            }
          ]
        })
    });
    simple.restore(jobNotify.ses, 'getSendQuota');
    simple.mock(jobNotify.ses, 'getSendQuota').callFn((obj, callback) => {
      callback(undefined, {
        Max24HourSend: 50,
        SentLast24Hours: 1
      });
    });
    simple.mock(jobNotify.sqs, 'deleteMessage').returnWith({
      promise: () => Promise.resolve({})
    });
    simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
      callback(undefined, true);
    });
    factoryManager.create(factoryEmailUser, { email: 'julian.molina@wolox.com.ar', offerId: 1 }).then(() => {
      jobNotify.notify().then(() => {
        setTimeout(() => {
          EmailUser.getBy({ offerId: 1, email: 'julian.molina@wolox.com.ar' }).then(user => {
            expect(user).to.not.equal(null);
            done();
          });
        }, 2000);
      });
    });
  });
});

describe('/retail/:id/offers/:id_offer GET', () => {
  const generateToken = (points = '11') => `bearer ${token.generate({ points })}`;
  it('should success get of offer', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv =>
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r =>
        factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id }).then(off => {
          chai
            .request(server)
            .get(`/retail/11/offers/${off.dataValues.id}`)
            .set('authorization', generateToken())
            .then(response => {
              response.should.have.status(200);
              expect(response.body).to.have.all.keys([
                'image',
                'product',
                'begin',
                'expires',
                'maxRedemptions',
                'redemptions',
                'status',
                'category',
                'typeOffer',
                'valueStrategy'
              ]);
              dictum.chai(response);
              done();
            });
        })
      )
    );
  });
  it('should fail get of offer because not exist', done => {
    chai
      .request(server)
      .get(`/retail/11/offers/15`)
      .set('authorization', generateToken())
      .then(response => {
        response.body.should.have.property('internal_code');
        response.body.should.have.property('message');
        response.body.internal_code.should.be.equal('offer_not_found');
        response.should.have.status(404);
        done();
      });
  });
  it('should fail get of offer because user is unauthorized', done => {
    chai
      .request(server)
      .get(`/retail/15/offers/15`)
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

describe('/retail/:id/offers/:id_offer/redemptions GET', () => {
  const generateToken = (points = '11') => `bearer ${token.generate({ points })}`;
  it('should fail because in the query doesnt exist page', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv =>
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r =>
        factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id }).then(off => {
          chai
            .request(server)
            .get(`/retail/1333/offers/${off.dataValues.id}/redemptions?`)
            .set(headerName, tokenExample)
            .then(res => {
              res.should.have.status(400);
              res.body.should.have.property('message');
              res.body.should.have.property('internal_code');
              done();
            });
        })
      )
    );
  });
  it('should be successful with one page but without limit', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv =>
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r =>
        factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id }).then(off =>
          factoryManager
            .create(factoryCode, {
              offerId: off.dataValues.id,
              dateRedemption: utils.moment()
            })
            .then(() =>
              factoryManager
                .create(factoryCode, {
                  offerId: off.dataValues.id,
                  dateRedemption: utils.moment()
                })
                .then(() => {
                  chai
                    .request(server)
                    .get(`/retail/11/offers/${off.dataValues.id}/redemptions?page=0`)
                    .set('authorization', generateToken())
                    .then(res => {
                      res.body.pages.should.eqls(1);
                      res.body.redemptions.length.should.eqls(2);
                      done();
                      dictum.chai(res);
                    });
                })
            )
        )
      )
    );
  });
  it('should be successful with one page, two offers but only one was redeemed', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv =>
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r =>
        factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id }).then(off =>
          factoryManager
            .create(factoryCode, {
              offerId: off.dataValues.id
            })
            .then(() =>
              factoryManager
                .create(factoryCode, {
                  offerId: off.dataValues.id,
                  dateRedemption: utils.moment()
                })
                .then(() => {
                  chai
                    .request(server)
                    .get(`/retail/11/offers/${off.dataValues.id}/redemptions?page=0`)
                    .set('authorization', generateToken())
                    .then(res => {
                      res.body.pages.should.eqls(1);
                      res.body.redemptions.length.should.eqls(1);
                      done();
                    });
                })
            )
        )
      )
    );
  });
  describe('/back/offers GET', () => {
    beforeEach(() =>
      Promise.all([factoryManager.create(factoryCategory), factoryManager.create(factoryTypeOffer)]).then(
        () =>
          Promise.all([
            factoryManager.create(factoryOffer, { product: 'hamburguer', nit: 12 }),
            factoryManager.create(factoryOffer, { product: 'hamburguer with cheese', nit: 34 }),
            factoryManager.create(factoryOffer, { nit: 1333 }),
            factoryManager.create(factoryOffer, { nit: 1234 })
          ])
      )
    );
    it('should be successful with filter ', done => {
      chai
        .request(server)
        .get(`/back/offers?filter=34`)
        .then(res => {
          res.should.have.status(200);
          res.body.pages.should.eqls(1);
          res.body.offers.length.should.eqls(2);
          done();
        });
    });
    it('should be successful with page and limit but without filter ', done => {
      chai
        .request(server)
        .get(`/back/offers?page=1&limit=2`)
        .then(res => {
          res.should.have.status(200);
          res.body.pages.should.eqls(2);
          res.body.offers.length.should.eqls(2);
          done();
        });
    });
    it('should be successful with page,limit and filter ', done => {
      chai
        .request(server)
        .get(`/back/offers?page=1&limit=1&filter=12`)
        .then(res => {
          res.should.have.status(200);
          res.body.pages.should.eqls(2);
          res.body.offers.length.should.eqls(1);
          done();
        });
    });
    it('should be successful with page and filter by product but without offers ', done => {
      chai
        .request(server)
        .get(`/back/offers?page=0&limit=5&filter=20% en hamburguer`)
        .then(res => {
          res.should.have.status(200);
          res.body.pages.should.eqls(0);
          res.body.offers.length.should.eqls(0);
          done();
        });
    });
    it('should be successful with filter by product ', done => {
      chai
        .request(server)
        .get(`/back/offers?filter=hamburguer`)
        .then(res => {
          res.should.have.status(200);
          res.body.pages.should.eqls(1);
          res.body.offers.length.should.eqls(2);
          done();
        });
    });
  });
  describe('/retail/:id/offers/:id_offer PATCH', () => {
    beforeEach(() =>
      Promise.all([factoryManager.create(factoryCategory), factoryManager.create(factoryTypeOffer)]).then(
        () => Promise.all([factoryManager.create(factoryOffer, { retail: 11 })])
      )
    );
    it('should be successful to disable offer', done => {
      chai
        .request(server)
        .patch(`/retail/11/offers/1`)
        .set('authorization', generateToken())
        .then(res => {
          res.should.have.status(200);
          Offer.getBy({ retail: 11 }).then(exist => {
            exist.dataValues.active.should.eqls(false);
            done();
          });
        });
    });
    it('should be successful to enable offer', done => {
      chai
        .request(server)
        .patch(`/retail/11/offers/1`)
        .set('authorization', generateToken())
        .then(() =>
          chai
            .request(server)
            .patch(`/retail/11/offers/1`)
            .set('authorization', generateToken())
            .then(res => {
              res.should.have.status(200);
              Offer.getBy({ retail: 11 }).then(exist => {
                exist.dataValues.active.should.eqls(true);
                done();
              });
            })
        );
    });
    it('should be fail because the offer does not exist', done => {
      chai
        .request(server)
        .patch(`/retail/11/offers/1254`)
        .set('authorization', generateToken())
        .then(res => {
          res.should.have.status(404);
          res.body.should.have.property('message');
          expect(res.body.message).to.equal('Offer Not Found');
          res.body.should.have.property('internal_code');
          expect(res.body.internal_code).to.equal('offer_not_found');
          done();
        });
    });

    it("Should send email to offer's redeemed code users", done => {
      simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
        callback(undefined, true);
      });

      factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
        factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
          factoryManager
            .create(factoryOffer, {
              retail: 11,
              category: rv.id,
              strategy: r.id,
              active: true
            })
            .then(off => {
              factoryManager.create(factoryCode, { offerId: off.id }).then(code => {
                chai
                  .request(server)
                  .patch(`/retail/11/offers/${off.id}`)
                  .set('authorization', generateToken())
                  .then(res => {
                    res.should.have.status(200);
                    mailer.transporter.sendMail.callCount.should.eqls(1);
                    done();
                  });
              });
            });
        });
      });
    });
  });

  describe('PATCH /back/offers/:id', () => {
    beforeEach(() => {
      simple.mock(requestService, 'getPoints').resolveWith({
        address: 'Cochabamba 3254',
        commerce: { description: 'McDonalds', nit: 1234 },
        posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
      });
    });
    it('Should disable an offer and send an email', done => {
      simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
        callback(undefined, true);
      });

      factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
        factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
          factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id, active: true }).then(off => {
            chai
              .request(server)
              .patch(`/back/offers/${off.id}`)
              .set('authorization', generateToken())
              .then(res => {
                res.should.have.status(200);
                dictum.chai(res);
                Offer.getBy({ id: off.id }).then(exist => {
                  exist.active.should.eqls(false);
                  mailer.transporter.sendMail.callCount.should.eqls(1);
                  done();
                });
              });
          });
        });
      });
    });

    it('Should not disable a not found offer and not send email', done => {
      simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
        callback(undefined, true);
      });

      factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
        factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
          factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id, active: true }).then(off => {
            chai
              .request(server)
              .patch(`/back/offers/${off.id + 1}`)
              .set('authorization', generateToken())
              .then(res => {
                res.should.have.status(404);
                Offer.getBy({ id: off.id }).then(exist => {
                  exist.active.should.eqls(true);
                  mailer.transporter.sendMail.callCount.should.eqls(0);
                  done();
                });
              });
          });
        });
      });
    });

    it("Should send email to offer's redeemed code offers", done => {
      simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
        callback(undefined, true);
      });

      factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
        factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
          factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id, active: true }).then(off => {
            factoryManager.create(factoryCode, { offerId: off.id }).then(code => {
              chai
                .request(server)
                .patch(`/back/offers/${off.id}`)
                .set('authorization', generateToken())
                .then(res => {
                  res.should.have.status(200);
                  mailer.transporter.sendMail.callCount.should.eqls(2);
                  done();
                });
            });
          });
        });
      });
    });
  });
});
