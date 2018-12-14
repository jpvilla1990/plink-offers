const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('../app'),
  expect = chai.expect,
  factoryManager = require('./factories/factoryManager');

describe('/genders GET', () => {
  it('should success find of genders', done => {
    factoryManager.createMany('Gender', 4).then(() => {
      chai
        .request(server)
        .get('/genders')
        .then(response => {
          expect(response.status).to.be.eql(200);
          expect(response.body).to.have.property('result');
          expect(response.body.result.length).to.be.eql(4);
          dictum.chai(response);
          done();
        });
    });
  });
});
describe('/ranges GET', () => {
  it('should success find of ranges', done => {
    factoryManager.createMany('Range', 4).then(() => {
      chai
        .request(server)
        .get('/ranges')
        .then(response => {
          expect(response.status).to.be.eql(200);
          expect(response.body).to.have.property('result');
          expect(response.body.result.length).to.be.eql(4);
          dictum.chai(response);
          done();
        });
    });
  });
});
