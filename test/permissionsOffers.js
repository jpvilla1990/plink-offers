const chai = require('chai'),
  dictum = require('dictum.js'),
  { generate } = require('./factories/token'),
  expect = chai.expect,
  server = require('./../app');

describe('Permissions offers', () => {
  it('should success because user is authorized', done => {
    chai
      .request(server)
      .get('/retail/1222/offers?page=0')
      .set('authorization', `bearer ${generate({ offers: true, points: '1222' })}`)
      .then(res => {
        expect(res.status).to.be.eql(200);
        dictum.chai(res);
        done();
      });
  });
  it('should fail because user is unauthorized', done => {
    chai
      .request(server)
      .get('/retail/1222/offers?page=0')
      .set('authorization', `bearer ${generate({ offers: false, points: '1222' })}`)
      .then(res => {
        expect(res.status).to.be.eql(401);
        done();
      });
  });
});
