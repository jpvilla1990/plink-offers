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
  factoryUserOffer = require('./factories/userOffer').nameFactory,
  requestService = require('../app/services/request'),
  rollbarService = require('../app/services/rollbar'),
  simple = require('simple-mock'),
  token = require('./factories/token'),
  JobCreator = require('../app/jobs/creatorUserOffer'),
  mailer = require('../app/services/mailer'),
  headerName = config.common.session.header_name,
  Offer = require('../app/models').offer,
  expectedErrorKeys = ['message', 'internal_code'],
  UserOffer = require('../app/models').user_offer,
  {
    OFFER_ACTIVE,
    OFFER_INACTIVE,
    OFFER_DISABLED,
    OFFER_FINISHED,
    OFFER_OUT_OF_STOCK
  } = require('../app/constants'),
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
    url: 'https://s3.amazonaws.com/plink-email-assets/plink_offers/bg_general.png',
    genders: ['Male', 'Female'],
    ranges: ['smaller than 17 years', '18 to 23']
  },
  offerWithoutProduct = {
    begin: '2017-02-13',
    expiration: '2017-05-24',
    category: 1,
    strategy: 1,
    valueStrategy: '30%',
    maxRedemptions: 1200,
    purpose: 'Atraer clientes',
    url: 'https://s3.amazonaws.com/plink-email-assets/plink_offers/bg_general.png',
    genders: ['Male', 'Female'],
    ranges: ['smaller than 17 years', '18 to 23']
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
    url: 'https://s3.amazonaws.com/plink-email-assets/plink_offers/bg_general.png',
    genders: ['Male', 'Female'],
    ranges: ['smaller than 17 years', '18 to 23']
  },
  tokenExample = `test ${token.generate({ points: '1222,1444,1333' })}`;

describe('/retail/:id/offers POST', () => {
  const offerWithRetail = offerExample;
  offerWithRetail.retail = 1222;
  beforeEach(() => {
    simple.mock(requestService, 'getPoints').resolveWith({
      address: 'Cochabamba 3254',
      reference: 'Next to McDonalds',
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
            expect(res.status).to.be.eql(201);
            Offer.getBy({ retail: 1222 }).then(exist => {
              expect(!!exist).to.be.true;
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
        expect(res.status).to.be.eql(400);
        expect(res.body).to.have.all.keys(expectedErrorKeys);
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
        expect(err.status).to.be.eql(400);
        expect(err.body).to.have.all.keys(expectedErrorKeys);
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
            expect(res.status).to.be.eql(201);
            Offer.getBy({ id: 1 }).then(exist => {
              expect(!!exist).to.be.true;
              expect(rollbarService.error.callCount).to.be.eql(1);
              done();
            });
          });
      });
    });
  });
});

describe('/retail/:id/offers GET', () => {
  it('should be successful with one page and limit', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create('ActiveOffer').then(off => {
          chai
            .request(server)
            .get('/retail/1222/offers?page=0')
            .set(headerName, tokenExample)
            .then(res => {
              expect(res.status).to.be.eql(200);
              expect(res.body).to.have.property('count');
              expect(res.body).to.have.property('offers');
              expect(res.body.offers.length).to.be.eql(1);
              dictum.chai(res);
              done();
            });
        });
      });
    });
  });
  it('should be successful for a offer out of stock', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create('ExpiredOffer', { maxRedemptions: 1, redemptions: 1 }).then(off => {
          chai
            .request(server)
            .get('/retail/1222/offers?page=0')
            .set(headerName, tokenExample)
            .then(res => {
              expect(res.status).to.be.eql(200);
              expect(res.body).to.have.property('count');
              expect(res.body).to.have.property('offers');
              expect(res.body.offers.length).to.be.eql(1);
              expect(res.body.offers[0].status).to.be.eql(OFFER_OUT_OF_STOCK);
              done();
            });
        });
      });
    });
  });

  it('should be successful  with one page but without limit', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create('ActiveOffer').then(off => {
          chai
            .request(server)
            .get('/retail/1222/offers?page=0')
            .set(headerName, tokenExample)
            .then(res => {
              expect(res.status).to.be.eql(200);
              expect(res.body).to.have.property('count');
              expect(res.body).to.have.property('offers');
              expect(res.body.offers.length).to.be.eql(1);
              done();
            });
        });
      });
    });
  });
  it('should be successful with offers ordered by creation time', done => {
    // The time is set so that the offers have different creation times.
    Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }),
      factoryManager.create(factoryOffer, { product: 'first', retail: 1222 })
    ]).then(() =>
      setTimeout(
        () =>
          factoryManager.create(factoryOffer, { product: 'second', retail: 1222 }).then(() => {
            chai
              .request(server)
              .get('/retail/1222/offers?page=0')
              .set(headerName, tokenExample)
              .then(res => {
                expect(res.status).to.be.eql(200);
                expect(res.body).to.have.property('count');
                expect(res.body).to.have.property('offers');
                expect(res.body.offers[0].product).to.be.eql('second');
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
        expect(res.status).to.be.eql(200);
        expect(res.body.offers.length).to.be.eql(0);
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
              expect(res.status).to.be.eql(200);
              expect(res.body).to.have.property('count');
              expect(res.body).to.have.property('offers');
              expect(res.body.offers.length).to.be.eql(1);
              expect(res.body.offers[0]).to.have.property('status');
              expect(res.body.offers[0].status).to.be.eql(OFFER_INACTIVE);
              expect(res.body.offers.length).to.be.eql(1);
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
              expect(res.status).to.be.eql(200);
              expect(res.body).to.have.property('count');
              expect(res.body).to.have.property('offers');
              expect(res.body.offers.length).to.be.eql(1);
              expect(res.body.offers[0]).to.have.property('status');
              expect(res.body.offers[0].status).to.be.eql(OFFER_ACTIVE);
              expect(res.body.offers.length).to.be.eql(1);
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
              expect(res.status).to.be.eql(200);
              expect(res.body).to.have.property('count');
              expect(res.body).to.have.property('offers');
              expect(res.body.offers.length).to.be.eql(1);
              expect(res.body.offers[0]).to.have.property('status');
              expect(res.body.offers[0].status).to.be.eql(OFFER_FINISHED);
              expect(res.body.offers.length).to.be.eql(1);
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

describe('job creator', () => {
  let offerId;
  beforeEach(() =>
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv =>
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r =>
        factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id }).then(off => {
          offerId = off.id;
          simple.mock(JobCreator.sqs, 'receiveMessage').returnWith({
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
          simple.mock(JobCreator.sqs, 'deleteMessage').returnWith({
            promise: () => Promise.resolve({})
          });
        })
      )
    ));
  it('should be fail because the user offer already exist ', done => {
    factoryManager
      .create(factoryUserOffer, {
        offerId,
        email: 'julian.molina@wolox.com.ar'
      })
      .then(() =>
        JobCreator.creatorUserOffer().then(() =>
          UserOffer.findAll({ where: { email: 'julian.molina@wolox.com.ar' } }).then(exist => {
            expect(exist.length).to.be.eqls(1);
            done();
          })
        )
      );
  });

  it('Should be successful for create a new user offer ', done => {
    factoryManager.create('DisabledOffer').then(off => {
      JobCreator.creatorUserOffer().then(() =>
        UserOffer.findOne({ where: { email: 'julian.molina@wolox.com.ar' } }).then(exist => {
          expect(exist).not.be.null;
          done();
        })
      );
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
              expect(response.status).to.be.eql(200);
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
                'valueStrategy',
                'genders',
                'ranges'
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
      .then(err => {
        expect(err.status).to.be.eql(404);
        expect(err.body).to.have.all.keys(expectedErrorKeys);
        expect(err.body.internal_code).to.be.eql('offer_not_found');
        done();
      });
  });
  it('should fail get of offer because user is unauthorized', done => {
    chai
      .request(server)
      .get(`/retail/15/offers/15`)
      .set('authorization', generateToken())
      .then(err => {
        expect(err.status).to.be.eql(401);
        expect(err.body).to.have.all.keys(expectedErrorKeys);
        expect(err.body.internal_code).to.be.eql('user_unauthorized');
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
              expect(res.status).to.be.eql(400);
              expect(res.body).to.have.all.keys(expectedErrorKeys);
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
                      expect(res.body.pages).to.be.eql(1);
                      expect(res.status).to.be.eql(200);
                      expect(res.body.redemptions.length).to.be.eql(2);
                      dictum.chai(res);
                      done();
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
          factoryManager
            .create(factoryCategory, { special: true })
            .then(cat =>
              Promise.all([
                factoryManager.create(factoryOffer, { product: 'hamburguer', nit: 12 }),
                factoryManager.create(factoryOffer, { product: 'hamburguer with cheese', nit: 34 }),
                factoryManager.create(factoryOffer, { nit: 1333 }),
                factoryManager.create(factoryOffer, { nit: 1234 }),
                factoryManager.create('SpecialOffer', { categoryId: cat.id, description: 'bancolombia' })
              ])
            )
      ));
    it('should be successful with filter ', done => {
      chai
        .request(server)
        .get(`/back/offers?filter=34`)
        .then(res => {
          expect(res.status).to.be.eql(200);
          expect(res.body.pages).to.be.eql(1);
          expect(res.body.offers.length).to.be.eql(2);
          dictum.chai(res);
          done();
        });
    });
    it('should be successful with page and limit but without filter ', done => {
      chai
        .request(server)
        .get(`/back/offers?page=1&limit=2`)
        .then(res => {
          expect(res.status).to.be.eql(200);
          expect(res.body.pages).to.be.eql(3);
          expect(res.body.offers.length).to.be.eql(2);
          done();
        });
    });
    it('should be successful with page,limit and filter ', done => {
      chai
        .request(server)
        .get(`/back/offers?page=1&limit=1&filter=12`)
        .then(res => {
          expect(res.status).to.be.eql(200);
          expect(res.body.pages).to.be.eql(2);
          expect(res.body.offers.length).to.be.eql(1);
          done();
        });
    });
    it('should be successful with page and filter by product but without offers ', done => {
      chai
        .request(server)
        .get(`/back/offers?page=0&limit=5&filter=20% en hamburguer`)
        .then(res => {
          expect(res.status).to.be.eql(200);
          expect(res.body.pages).to.be.eql(0);
          expect(res.body.offers.length).to.be.eql(0);
          done();
        });
    });
    it('should be successful with filter by product ', done => {
      chai
        .request(server)
        .get(`/back/offers?filter=hamburguer`)
        .then(res => {
          expect(res.status).to.be.eql(200);
          expect(res.body.pages).to.be.eql(1);
          expect(res.body.offers.length).to.be.eql(2);
          done();
        });
    });
    it('should be successful with filter by description for special offer ', done => {
      chai
        .request(server)
        .get(`/back/offers?filter=banco`)
        .then(res => {
          expect(res.status).to.be.eql(200);
          expect(res.body.pages).to.be.eql(1);
          expect(res.body.offers.length).to.be.eql(1);
          expect(res.body.offers[0].special).to.be.true;
          done();
        });
    });
    it('should be successful with filter by description for special offer ', done => {
      chai
        .request(server)
        .get(`/back/offers?filter=banco`)
        .then(res => {
          res.should.have.status(200);
          res.body.pages.should.eqls(1);
          res.body.offers.length.should.eqls(1);
          res.body.offers[0].special.should.eqls(true);
          done();
        });
    });
  });
  describe('/retail/:id/offers/:id_offer PATCH', () => {
    beforeEach(() =>
      Promise.all([factoryManager.create(factoryCategory), factoryManager.create(factoryTypeOffer)]).then(
        () => Promise.all([factoryManager.create(factoryOffer, { retail: 11 })])
      ));
    it('should be successful to disable offer', done => {
      chai
        .request(server)
        .patch(`/retail/11/offers/1`)
        .set('authorization', generateToken())
        .then(res => {
          expect(res.status).to.be.eql(200);
          Offer.getBy({ retail: 11 }).then(exist => {
            expect(exist.dataValues.active).to.be.false;
            dictum.chai(res);
            done();
          });
        });
    });
    it('should be fail because the offer does not exist', done => {
      chai
        .request(server)
        .patch(`/retail/11/offers/1254`)
        .set('authorization', generateToken())
        .then(res => {
          expect(res.status).to.be.eql(404);
          expect(res.body).to.have.all.keys(expectedErrorKeys);
          expect(res.body.message).to.equal('Offer Not Found');
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
                    expect(res.status).to.be.eql(200);
                    expect(mailer.transporter.sendMail.callCount).to.be.eql(1);
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
        reference: 'Next to McDonalds',
        commerce: { description: 'McDonalds', nit: 1234 },
        posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
      });
      simple.mock(mailer.transporter, 'sendMail').callFn((obj, callback) => {
        callback(undefined, true);
      });
    });
    it('Should disable an offer and send an email', done => {
      factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
        factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
          factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id, active: true }).then(off => {
            chai
              .request(server)
              .patch(`/back/offers/${off.id}`)
              .set('authorization', generateToken())
              .then(res => {
                expect(res.status).to.be.eql(200);
                Offer.getBy({ id: off.id }).then(exist => {
                  expect(exist.active).to.be.false;
                  expect(mailer.transporter.sendMail.callCount).to.be.eql(1);
                  dictum.chai(res);
                  done();
                });
              });
          });
        });
      });
    });
    it('Should disable an offer and dont send an email because the offer is special', done => {
      factoryManager.create(factoryCategory, { name: 'Bancolombia', special: true }).then(rv =>
        factoryManager.create('SpecialOffer', { categoryId: rv.id }).then(off =>
          chai
            .request(server)
            .patch(`/back/offers/${off.id}`)
            .set('authorization', generateToken())
            .then(res => {
              expect(res.status).to.be.eql(200);
              Offer.getBy({ id: off.id }).then(exist => {
                expect(exist.active).to.be.false;
                expect(mailer.transporter.sendMail.callCount).to.be.eql(0);
                done();
              });
            })
        )
      );
    });
    it('Should disable an offer was disabled before and dont send mail', done => {
      factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
        factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
          factoryManager.create('ActiveOffer', { category: rv.id, strategy: r.id }).then(off => {
            chai
              .request(server)
              .patch(`/back/offers/${off.id}`)
              .set('authorization', generateToken())
              .then(() => {
                chai
                  .request(server)
                  .patch(`/back/offers/${off.id}`)
                  .set('authorization', generateToken())
                  .then(res => {
                    expect(res.status).to.be.eql(200);
                    expect(mailer.transporter.sendMail.callCount).to.be.eql(2);
                    done();
                  });
              });
          });
        });
      });
    });

    it('Should not disable a not found offer and not send email', done => {
      factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
        factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
          factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id, active: true }).then(off => {
            chai
              .request(server)
              .patch(`/back/offers/${off.id + 1}`)
              .set('authorization', generateToken())
              .then(res => {
                expect(res.status).to.be.eql(404);
                Offer.getBy({ id: off.id }).then(exist => {
                  expect(exist.active).to.be.true;
                  expect(mailer.transporter.sendMail.callCount).to.be.eql(0);
                  done();
                });
              });
          });
        });
      });
    });

    it("Should send email to offer's redeemed code offers", done => {
      factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
        factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
          factoryManager.create(factoryOffer, { category: rv.id, strategy: r.id, active: true }).then(off => {
            factoryManager.create(factoryCode, { offerId: off.id }).then(code => {
              chai
                .request(server)
                .patch(`/back/offers/${off.id}`)
                .set('authorization', generateToken())
                .then(res => {
                  expect(res.status).to.be.eql(200);
                  expect(mailer.transporter.sendMail.callCount).to.be.eql(2);
                  done();
                });
            });
          });
        });
      });
    });
  });

  describe('GET /back/offers/:id_offer', () => {
    beforeEach(() =>
      simple.mock(requestService, 'getPoints').resolveWith({
        address: 'Cochabamba 3254',
        reference: 'Next to McDonalds',
        commerce: { description: 'McDonalds', nit: 1234, imageUrl: 'fake-image.png' },
        posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
      }));
    it('Should be success get offer', done => {
      factoryManager.create(factoryOffer).then(off =>
        chai
          .request(server)
          .get(`/back/offers/${off.id}`)
          .set('authorization', generateToken())
          .then(res => {
            expect(res.status).to.be.eql(200);
            dictum.chai(res);
            done();
          })
      );
    });
    it('Should be success get special offer', done => {
      factoryManager.create(factoryCategory, { special: true }).then(({ id }) =>
        factoryManager.create('SpecialOffer', { categoryId: id }).then(off =>
          chai
            .request(server)
            .get(`/back/offers/${off.id}`)
            .set('authorization', generateToken())
            .then(res => {
              res.should.have.status(200);
              res.body.special.should.eql(true);
              done();
            })
        )
      );
    });
    it('Should be fail because the offer does not exist', done => {
      factoryManager.create(factoryOffer).then(off =>
        chai
          .request(server)
          .get(`/back/offers/4541`)
          .set('authorization', generateToken())
          .then(res => {
            expect(res.body).to.have.all.keys(expectedErrorKeys);
            expect(res.body.message).to.equal('Offer Not Found');
            expect(res.body.internal_code).to.equal('offer_not_found');
            done();
          })
      );
    });
  });
});
