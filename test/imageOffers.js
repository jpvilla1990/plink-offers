const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app');

describe('/image-offers GET', () => {
  it('should success get of url for image', done => {
    chai
      .request(server)
      .get('/image-offer')
      .then(response => {
        response.should.have.status(200);
        response.body.should.have.property('url');
        response.body.should.have.property('cdn');
        dictum.chai(response);
        done();
      });
  });
});
