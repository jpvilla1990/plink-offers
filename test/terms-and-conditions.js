const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  FakeTermsAndConditions = require('./factories/termsAndConditions').FakeTermsAndConditions,
  FactoryManager = require('../test/factories/factoryManager'),
  should = chai.should(),
  expect = chai.expect;

describe('/offers-public/terms-and-conditions GET', () => {
  it('Should get terms and conditions', done => {
    FactoryManager.create('FakeTermsAndConditions').then(tac => {
      chai
        .request(server)
        .get('/offers-public/terms-and-conditions')
        .then(res => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('version');
          res.body.should.have.property('content');
          res.body.should.eql(FakeTermsAndConditions);
          done();
        });
    });
  });

  it('Should not found terms and conditions', done => {
    chai
      .request(server)
      .get('/offers-public/terms-and-conditions')
      .then(res => {
        res.should.have.status(404);
        res.should.be.json;
        res.body.should.have.property('message');
        res.body.should.have.property('internal_code');
        res.body.internal_code.should.equal('terms_and_conditions_not_found');
        done();
      });
  });
});
