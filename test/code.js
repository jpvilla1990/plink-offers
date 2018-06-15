const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  logger = require('../app/logger'),
  config = require('../config'),
  utils = require('../app/utils'),
  moment = require('moment'),
  Offer = require('../app/models').offer,
  Code = require('../app/models').code,
  token = require('../test/factories/token'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryCategory = require('../test/factories/category').nameFactory,
  factoryTypeOffer = require('../test/factories/typeOffer').nameFactory,
  factoryOffer = require('../test/factories/offer').nameFactory,
  should = chai.should(),
  headerName = config.common.session.header_name,
  factoryCode = require('../test/factories/code').nameFactory;

const offerWithRetail = {
  product: '2x1 en McDuo',
  begin: '2017-02-13',
  expiration: moment().format('YYYY-MM-DD'),
  category: 1,
  strategy: 1,
  valueStrategy: '30%',
  maxRedemptions: 1200,
  purpose: 'Atraer clientes',
  extension: 'jpg'
};
describe('/offers/:id/code POST', () => {
  offerWithRetail.retail = 1222;
  const email = { email: 'example@saraza.com.ar' };
  it('should be successful', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer, offerWithRetail).then(before => {
          chai
            .request(server)
            .post(`/offers/${before.id}/code`)
            .send(email)
            .then(json => {
              json.should.have.status(200);
              json.should.be.json;
              Offer.getBy({ id: before.id }).then(after => {
                after.codes.should.eqls(1);
              });
              dictum.chai(json);
            })
            .then(() => done());
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
            .send(email)
            .then(err => {
              err.should.have.status(400);
              err.should.be.json;
              err.body.should.have.property('message');
              err.body.should.have.property('internal_code');
              done();
            });
        });
      });
    });
  });
  it('should be fail because the offer expired', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer, offerWithRetail).then(before => {
          chai
            .request(server)
            .post(`/offers/${before.id}/code`)
            .send({})
            .then(err => {
              err.should.have.status(400);
              err.should.be.json;
              err.body.should.have.property('message');
              err.body.should.have.property('internal_code');
              done();
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
