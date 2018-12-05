const bucket = require('../../../config').common.aws.bucket,
  rp = require('request-promise'),
  url = require('../../../config').common.server.info_retail,
  environment = require('../../../config').common.environment;

const getPointSaleId = () => {
  if (environment !== 'production' && environment !== 'staging') {
    return Promise.resolve(1);
  }
  return rp({
    uri: `${url}/points?limit=10&page=0&description=999989&nit=&id=&type=posId`,
    json: true
  }).then(body => (body.rows ? body.rows[0].id : 1));
};

module.exports = bancolombiaId =>
  getPointSaleId().then(pointSaleId => [
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '2x1 en Cinemark',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_001_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_001_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: 'Rappi Prime para clientes Bancolombia Amex',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_002_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_002_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: `40% dcto. online L'Bel`,
      begin: '2018-12-03',
      expiration: '2018-12-09',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_003_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_003_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '40% dcto. online Esika',
      begin: '2018-12-03',
      expiration: '2018-12-09',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_004_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_004_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '40% dcto. online Cyzone',
      begin: '2018-12-03',
      expiration: '2018-12-09',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_005_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_005_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '10% dcto. adicional para hacer mercado',
      begin: '2018-12-03',
      expiration: '2018-12-14',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_006_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_006_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: 'Obsequio navideño',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_007_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_007_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '0% interés a 6 y 12 meses',
      begin: '2018-12-03',
      expiration: '2018-12-24',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_008_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_008_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '0% interés a 6 y 12 meses',
      begin: '2018-12-03',
      expiration: '2018-12-24',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_009_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_009_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: 'Renueva tu casa con los días de hogar Jamar',
      begin: '2018-12-03',
      expiration: '2018-12-27',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_010_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_010_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: 'Compra una bicicleta TREK y te obsequiamos una bicicleta CLIFF',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_011_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_011_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: 'Beneficios únicos en Nespresso',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_012_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_012_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '30% dcto. del 15 de nov al 31 dic de 2018',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_013_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_013_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '$30 MILLONES en viajes podrás ganar',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_014_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_014_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '50% dcto. en plan personal y platinum',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_015_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_015_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '35% dcto. en tienda Online',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_016_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_016_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '0% de interés de 2 a 36 cuotas en Mercado Libre',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_017_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_017_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '15% dcto. en servicios para tu mascota',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_018_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_018_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: `Todos los días 50% dcto. en Domino's`,
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_019_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_019_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '0% en la tasa de interés en paquetes y productos de Despegar',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_020_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_020_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '25% dcto. en SPA y Late Check Out',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_021_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_021_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '0% de interés en el Smartphone que quieras',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_022_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_022_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    },
    {
      nit: 890903938,
      retail: pointSaleId,
      description: '20% dcto. los martes en American Eagle',
      begin: '2018-12-03',
      expiration: '2018-12-31',
      image_url: `https://s3.amazonaws.com/${bucket}/OB_023_img.jpg`,
      link: `https://s3.amazonaws.com/${bucket}/terms/OB_023_tyc.pdf`,
      category_id: bancolombiaId,
      created_at: '2018-12-03',
      updated_at: '2018-12-03'
    }
  ]);
