const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  moment = require('moment'),
  factoryManager = require('../test/factories/factoryManager'),
  token = require('../test/factories/token'),
  factoryOffer = require('../test/factories/offer').nameFactory,
  factoryCode = require('../test/factories/code').nameFactory;

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
