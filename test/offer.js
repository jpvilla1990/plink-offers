const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  logger = require('../app/logger'),
  config = require('../config'),
  factoryManager = require('../test/factories/factoryManager'),
  factoryCategory = require('../test/factories/category').nameFactory,
  factoryTypeOffer = require('../test/factories/typeOffer').nameFactory,
  factoryOffer = require('../test/factories/offer').nameFactory,
  token = require('./factories/token'),
  should = chai.should(),
  headerName = config.common.session.header_name,
  Offer = require('../app/models').offer,
  offerExample = {
    product: '2x1 en McDuo',
    begin: '2017-02-13',
    expiration: '2017-05-24',
    category: 1,
    strategy: 1,
    valueStrategy: '30%',
    maxRedemptions: 1200,
    purpose: 'Atraer clientes',
    extension: 'jpg'
  },
  offerWithoutProduct = {
    begin: '2017-02-13',
    expiration: '2017-05-24',
    category: 1,
    strategy: 1,
    valueStrategy: '30%',
    maxRedemptions: 1200,
    purpose: 'Atraer clientes',
    extension: 'jpg'
  },
  offerWithCategoryWrong = {
    product: '2x1 en McDuo',
    begin: '2017-02-13',
    expiration: '2017-05-24',
    category: 'travel',
    strategy: 1,
    valueStrategy: '30%',
    maxRedemptions: 1200,
    purpose: 'Atraer clientes',
    extension: 'jpg'
  },
  tokenExample = `test ${token.generate({ points: '1222,1444,1333' })}`;

describe('/retail/:id/offers POST', () => {
  const offerWithRetail = offerExample;
  offerWithRetail.retail = 1222;
  it('should be successful', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        chai
          .request(server)
          .post('/retail/1222/offers')
          .set(headerName, tokenExample)
          .send(offerExample)
          .then(json => {
            json.should.have.status(200);
            json.should.be.json;
            json.body.should.have.property('urlBucket');
            dictum.chai(json);
            Offer.getBy({ retail: 1222 }).then(exist => {
              const off = !!exist;
              off.should.eql(true);
            });
          })
          .then(() => done());
      });
    });
  });
  it('should be fail because category isnt string', done => {
    chai
      .request(server)
      .post('/retail/1222/offers')
      .set(headerName, tokenExample)
      .send(offerWithCategoryWrong)
      .catch(err => {
        err.should.have.status(400);
        err.body.should.be.json;
        err.body.should.have.property('message');
        err.body.should.have.property('internalCode');
      })
      .then(() => done());
  });
  it('should be fail because didnt sent product', done => {
    chai
      .request(server)
      .post('/retail/1222/offers')
      .set(headerName, tokenExample)
      .send(offerWithoutProduct)
      .catch(err => {
        err.should.have.status(400);
        err.body.should.be.json;
        err.body.should.have.property('message');
        err.body.should.have.property('internalCode');
      })
      .then(() => done());
  });
});

describe('/retail/:id/offers GET', () => {
  it('should be successful with one page and with limit', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer, offerExample).then(off => {
          chai
            .request(server)
            .get('/retail/1222/offers?page=0')
            .set(headerName, tokenExample)
            .then(json => {
              json.should.have.status(200);
              json.should.be.json;
              json.body.should.have.property('count');
              json.body.should.have.property('offers');
              json.body.offers.length.should.eql(1);
              dictum.chai(json);
            })
            .then(() => done());
        });
      });
    });
  });
  it('should be succesfull  with one page but without limit', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer, offerExample).then(off => {
          chai
            .request(server)
            .get('/retail/1222/offers?page=0')
            .set(headerName, tokenExample)
            .then(json => {
              json.should.have.status(200);
              json.should.be.json;
              json.body.should.have.property('count');
              json.body.should.have.property('offers');
              json.body.offers.length.should.eql(1);
              dictum.chai(json);
            })
            .then(() => done());
        });
      });
    });
  });
  it('should be fail because in the query doesnt exist page', done => {
    chai
      .request(server)
      .get('/retail/1222/offers?page=0')
      .set(headerName, tokenExample)
      .catch(err => {
        err.should.have.status(400);
        err.body.should.be.json;
        err.body.should.have.property('message');
        err.body.should.have.property('internalCode');
      })
      .then(() => done());
  });
});
