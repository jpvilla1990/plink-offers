const chai = require('chai'),
  dictum = require('dictum.js'),
  moment = require('moment'),
  server = require('./../app'),
  requestService = require('../app/services/request'),
  simple = require('simple-mock'),
  expect = chai.expect,
  token = require('../test/factories/token'),
  cognitoService = require('../app/services/cognito'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryOffer = require('../test/factories/offer').nameFactory,
  factoryCategory = require('../test/factories/category').nameFactory,
  factoryEmailUser = require('../test/factories/emailUser').nameFactory,
  factoryCode = require('../test/factories/code').nameFactory;

describe('/offer-app/offers GET', () => {
  const generateToken = (email = 'julian.molina@wolox.com.ar') => `bearer ${token.generate({ email })}`,
    email = 'julian.molina@wolox.com.ar';
  simple.mock(requestService, 'getPoints').resolveWith({
    address: 'Cochabamba 3254',
    commerce: { description: 'McDonalds', nit: '112233', imageUrl: '' },
    posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
  });
  it('should be success get one offers for specific category ( food ) ', done => {
    Promise.all([
      factoryManager.create(factoryCategory, { name: 'travel' }),
      factoryManager.create(factoryCategory, { name: 'food' }),
      factoryManager.create(factoryOffer, { categoryId: 1 }),
      factoryManager.create(factoryOffer, { categoryId: 2 })
    ]).then(() => {
      Promise.all([
        factoryManager.create(factoryCode, { email, offerId: 1 }),
        factoryManager.create(factoryCode, { email, offerId: 2 }),
        factoryManager.create(factoryEmailUser, { email, offerId: 1 }),
        factoryManager.create(factoryEmailUser, { email, offerId: 2 })
      ]).then(() => {
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
                response.body.count.should.eqls(2);
                response.body.offers.length.should.eqls(2);
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
          response.should.have.status(200);
          response.body.count.should.eqls(4);
          response.body.codes[0].status.should.eqls('active');
          response.body.codes[1].status.should.eqls('active');
          response.body.codes[1].dateRedemption.should.eqls(moment().format('YYYY-MM-DD'));
          response.body.codes[2].status.should.eqls('finished');
          response.body.codes[3].status.should.eqls('disabled');
          response.body.pages.should.eqls(1);
          response.body.count.should.eqls(4);
          done();
        })
    );
  });
  describe('/offer-app/offers/:id_offer GET', () => {
    it('should be success get a offer with code', done => {
      simple.mock(requestService, 'getPoints').resolveWith({
        address: 'Cochabamba 3254',
        commerce: { description: 'McDonalds', nit: '112233', imageUrl: '' },
        posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
      });
      let idOffer;
      factoryManager
        .create('ActiveOffer')
        .then(off => {
          idOffer = off.dataValues.id;
          factoryManager.create(factoryCode, { email, offerId: off.dataValues.id });
        })
        .then(() =>
          chai
            .request(server)
            .get(`/offer-app/offers/${idOffer}`)
            .set('authorization', generateToken())
            .then(response => {
              response.should.have.status(200);
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
        commerce: { description: 'McDonalds', nit: '112233', imageUrl: '' },
        posTerminals: [{ posId: '123' }, { posId: '456' }, { posId: '789' }, { posId: '152' }]
      });
      factoryManager.create('ActiveOffer').then(off =>
        chai
          .request(server)
          .get(`/offer-app/offers/${off.dataValues.id}`)
          .set('authorization', generateToken())
          .then(response => {
            response.should.have.status(200);
            expect(response.body.code).to.be.undefined;
            done();
          })
      );
    });
    it('Should be fail because the offer does not exist', done => {
      factoryManager.create(factoryOffer).then(off =>
        chai
          .request(server)
          .get(`/offer-app/offers/1236784`)
          .set('authorization', generateToken())
          .then(err => {
            err.body.should.have.property('message');
            expect(err.body.message).to.equal('Offer Not Found');
            err.body.should.have.property('internal_code');
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
          response.should.have.status(200);
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
          response.should.have.status(200);
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
        .then(response => {
          response.body.should.have.property('message');
          expect(response.body.message).to.equal('InternalErrorException');
          response.body.should.have.property('internal_code');
          expect(response.body.internal_code).to.equal('bad_request');
          done();
        });
    });
    it('should be fail because does not send email', done => {
      chai
        .request(server)
        .post(`/offers-public/users`)
        .set('authorization', generateToken())
        .then(response => {
          response.body.should.have.property('message');
          expect(response.body.message).to.include('The email is required');
          response.body.should.have.property('internal_code');
          expect(response.body.internal_code).to.equal('bad_request');
          done();
        });
    });
  });
});
