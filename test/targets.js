const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('../app'),
  factoryManager = require('./factories/factoryManager');

describe('/genders GET', () => {
  it('should success find of genders', done => {
    factoryManager.createMany('Gender', 4).then(() => {
      chai
        .request(server)
        .get('/genders')
        .then(response => {
          response.should.have.status(200);
          response.body.should.have.property('result');
          response.body.result.length.should.be.equal(4);
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
          response.should.have.status(200);
          response.body.should.have.property('result');
          response.body.result.length.should.be.equal(4);
          dictum.chai(response);
          done();
        });
    });
  });
});
