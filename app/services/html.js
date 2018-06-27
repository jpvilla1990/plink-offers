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
      brand_logo: serviceS3.getUrlEmail('avatar'),
      ticket: serviceS3.getUrlEmail('ticket'),
      img_offer: offer.imageUrl,
      value_strategy: offer.valueStrategy,
      product: offer.product,
      code: code.code,
      available: offer.maxRedemptions - offer.redemptions,
      max_redemptions: offer.max_redemptions,
      expiration: offer.expiration,
      name_retail: offer.retailName,
      addres: offer.retailAddres
    },
    html = pug.renderFile(templateDir, params);
  return html;
};

exports.offerExpired = (offer, code) => {
  const templateDir = path.join(__dirname, `/emailTemplates/offerExpired.pug`),
    params = {
      logo_plink: serviceS3.getUrlEmail('logo_plink'),
      bg_footer: serviceS3.getUrlEmail('bg_footer'),
      bg_expired_general: serviceS3.getUrlEmail('bg_expired_general'),
      bg_general_code: serviceS3.getUrlEmail('bg_general_code'),
      logo_bancocolombia: serviceS3.getUrlEmail('logo_bancocolombia'),
      logo_superintendence: serviceS3.getUrlEmail('logo_superintendencia'),
      brand_logo: serviceS3.getUrlEmail('brand_logo'),
      ticket: serviceS3.getUrlEmail('ticket'),
      ic_error_mail: serviceS3.getUrlEmail('ic_error_mail'),
      img_offer: offer.imageUrl,
      value_strategy: offer.valueStrategy,
      product: offer.product,
      expiration: offer.expiration,
      name_retail: offer.retailName,
      addres: offer.retailAddres
    },
    html = pug.renderFile(templateDir, params);
  return html;
};
