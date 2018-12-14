const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  FakeTermsAndConditions = require('./factories/termsAndConditions').FakeTermsAndConditions,
  FactoryManager = require('../test/factories/factoryManager'),
  expectedErrorKeys = ['message', 'internal_code'],
  expect = chai.expect;

describe('/offers-public/terms-and-conditions GET', () => {
  it('Should get terms and conditions', done => {
    FactoryManager.create('FakeTermsAndConditions').then(tac => {
      chai
        .request(server)
        .get('/offers-public/terms-and-conditions')
        .then(res => {
          expect(res.status).to.be.eql(200);
          expect(res).to.be.json;
          expect(res.body).to.have.property('version');
          expect(res.body).to.have.property('content');
          expect(res.body).to.be.eql(FakeTermsAndConditions);
          dictum.chai(res);
          done();
        });
    });
  });
  it('Should not found terms and conditions', done => {
    chai
      .request(server)
      .get('/offers-public/terms-and-conditions')
      .then(res => {
        expect(res.status).to.be.eql(404);
        expect(res).to.be.json;
        expect(res.body).to.have.all.keys(expectedErrorKeys);
        expect(res.body.internal_code).to.be.eql('terms_and_conditions_not_found');
        done();
      });
  });
});
