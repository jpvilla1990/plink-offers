const chai = require('chai'),
  { generate } = require('./factories/token'),
  server = require('./../app');

describe('Permissions offers', () => {
  it('should success because user is authorized', done => {
    chai
      .request(server)
      .get('/retail/1222/offers?page=0')
      .set('authorization', `bearer ${generate({ offers: true, points: '1222' })}`)
      .then(res => {
        res.should.have.status(200);
        done();
      });
  });
  it('should fail because user is unauthorized', done => {
    chai
      .request(server)
      .get('/retail/1222/offers?page=0')
      .set('authorization', `bearer ${generate({ offers: false, points: '1222' })}`)
      .then(res => {
        res.should.have.status(401);
        done();
      });
  });
});
