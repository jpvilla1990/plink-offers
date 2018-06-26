const pug = require('pug'),
  serviceS3 = require('../services/s3'),
  path = require('path');

exports.newCode = (offer, code) => {
  const templateDir = path.join(__dirname, `/emailTemplates/newCode.pug`),
    params = {
      logo_plink: serviceS3.getUrlEmail('logo_plink'),
      bg_footer: serviceS3.getUrlEmail('bg_footer'),
      bg_general_code: serviceS3.getUrlEmail('bg_general_code'),
      logo_bancocolombia: serviceS3.getUrlEmail('logo_bancocolombia'),
      logo_superintendence: serviceS3.getUrlEmail('logo_superintendencia'),
      brand_logo: serviceS3.getUrlEmail('brand_logo'),
      ticket: serviceS3.getUrlEmail('ticket'),
      img_offer: serviceS3.getUrlOffer(offer.id, offer.imgExtension),
      value_strategy: offer.valueStrategy,
      product: offer.product,
      code: code.code,
      available: offer.maxRedemptions - offer.redemptions,
      expiration: offer.expiration
    },
    html = pug.renderFile(templateDir, params);
  return html;
};
