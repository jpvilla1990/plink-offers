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
  requestService = require('../app/services/request'),
  simple = require('simple-mock'),
  token = require('./factories/token'),
  jobNotify = require('../app/jobs/notify'),
  should = chai.should(),
  mailer = require('../app/services/mailer'),
  headerName = config.common.session.header_name,
  Offer = require('../app/models').offer,
  Category = require('../app/models').category,
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
    simple.mock(requestService, 'retail').resolveWith({
      addres: 'Cochabamba 3254',
      commerce: { description: 'McDonalds' },
      posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
    });
    simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
      callback(undefined, true);
    });
  });
  it('should be successful', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        chai
          .request(server)
          .post('/retail/1222/offers')
          .set(headerName, tokenExample)
          .send(offerExample)
          .then(json => {
            json.should.have.status(201);
            Offer.getBy({ retail: 1222 }).then(exist => {
              const off = !!exist;
              off.should.eql(true);
              dictum.chai(json);
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
  it('should be succesfull  with one page but without limit', done => {
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
  it('should be fail because in the query doesnt exist page', done => {
    chai
      .request(server)
      .get('/retail/1222/offers?')
      .set(headerName, tokenExample)
      .then(json => {
        json.should.have.status(400);
        json.body.should.have.property('message');
        json.body.should.have.property('internal_code');
        done();
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
  it('should be successful ', done => {
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
        mailer.transporter.sendMail.callCount.should.eqls(3);
        done();
      }, 3000);
    });
  });
});

describe('/access-offer POST', () => {
  it('should be success', done => {
    chai
      .request(server)
      .post('/access-offer')
      .send({ code: config.common.access_offer })
      .then(json => {
        json.should.have.status(200);
        done();
      });
  });
  it('should be fail because the code was not sent ', done => {
    chai
      .request(server)
      .post('/access-offer')
      .then(json => {
        json.should.have.status(401);
        done();
      });
  });
  it('should be fail because the code is incorrect ', done => {
    chai
      .request(server)
      .post('/access-offer')
      .send({ code: 'code123' })
      .then(json => {
        json.should.have.status(401);
        done();
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
            .then(json => {
              json.should.have.status(400);
              json.body.should.have.property('message');
              json.body.should.have.property('internal_code');
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
});
