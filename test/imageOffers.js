const chai = require('chai'),
  dictum = require('dictum.js'),
  expect = chai.expect,
  server = require('./../app');

describe('/image-offers GET', () => {
  it('should success get of url for image', done => {
    chai
      .request(server)
      .get('/image-offer')
      .then(response => {
        expect(response.status).to.be.eql(200);
        expect(response.body).to.have.property('url');
        expect(response.body).to.have.property('cdn');
        dictum.chai(response);
        done();
      });
  });
});
