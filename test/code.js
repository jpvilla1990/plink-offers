const chai = require('chai'),
  dictum = require('dictum.js'),
  server = require('./../app'),
  logger = require('../app/logger'),
  config = require('../config'),
  utils = require('../app/utils'),
  moment = require('moment'),
  Offer = require('../app/models').offer,
  Code = require('../app/models').code,
  factoryManager = require('../test/factories/factoryManager'),
  factoryCategory = require('../test/factories/category').nameFactory,
  factoryTypeOffer = require('../test/factories/typeOffer').nameFactory,
  factoryOffer = require('../test/factories/offer').nameFactory,
  should = chai.should(),
  headerName = config.common.session.header_name;

const offerWithRetail = {
  product: '2x1 en McDuo',
  begin: '2017-02-13',
  expiration: moment().format('YYYY-MM-DD'),
  category: 1,
  strategy: 1,
  valueStrategy: '30%',
  maxRedemptions: 1200,
  purpose: 'Atraer clientes',
  extension: 'jpg'
};
describe('/offers/:id/code POST', () => {
  offerWithRetail.retail = 1222;
  const email = { email: 'example@saraza.com.ar' };
  it('should be successful', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer, offerWithRetail).then(before => {
          chai
            .request(server)
            .post(`/offers/${before.id}/code`)
            .send(email)
            .then(json => {
              json.should.have.status(200);
              json.should.be.json;
              Offer.getBy({ id: before.id }).then(after => {
                after.codes.should.eqls(1);
              });
              dictum.chai(json);
            })
            .then(() => done());
        });
      });
    });
  });
  it('should be fail because the offer expired', done => {
    offerWithRetail.expiration = moment()
      .subtract(2, 'days')
      .format('YYYY-MM-DD');
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer, offerWithRetail).then(before => {
          chai
            .request(server)
            .post(`/offers/${before.id}/code`)
            .send(email)
            .then(err => {
              err.should.have.status(400);
              err.should.be.json;
              err.body.should.have.property('message');
              err.body.should.have.property('internal_code');
            })
            .then(() => done());
        });
      });
    });
  });
  it('should be fail because the offer expired', done => {
    factoryManager.create(factoryCategory, { name: 'travel' }).then(rv => {
      factoryManager.create(factoryTypeOffer, { description: 'percentage' }).then(r => {
        factoryManager.create(factoryOffer, offerWithRetail).then(before => {
          chai
            .request(server)
            .post(`/offers/${before.id}/code`)
            .send({})
            .then(err => {
              err.should.have.status(400);
              err.should.be.json;
              err.body.should.have.property('message');
              err.body.should.have.property('internal_code');
            })
            .then(() => done());
        });
      });
    });
  });
});
