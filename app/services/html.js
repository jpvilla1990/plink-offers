const pug = require('pug'),
  path = require('path'),
  config = require('../../config'),
  serviceS3 = require('../services/s3'),
  constants = require('../constants');

exports.newCode = (offer, code) => {
  const templateDir = path.join(__dirname, `/emailTemplates/newCode.pug`),
    params = {
      logo_plink: serviceS3.getUrlEmail('logo_plink'),
      bg_footer: serviceS3.getUrlEmail('bg_footer'),
      bg_general_code: serviceS3.getUrlEmail('bg_general_code'),
      logo_bancocolombia: serviceS3.getUrlEmail('logo_bancocolombia'),
      logo_superintendence: serviceS3.getUrlEmail('logo_superintendencia'),
      brand_logo: offer.retailImageUrl || serviceS3.getUrlEmail('ic_default_comercio'),
      ticket: serviceS3.getUrlEmail('ticket'),
      mail_separator: serviceS3.getUrlEmail('mail_separator'),
      img_offer: offer.imageUrl,
      value_strategy: offer.valueStrategy,
      product: offer.product,
      code: code.code,
      available: offer.maxRedemptions - offer.redemptions,
      max_redemptions: offer.max_redemptions,
      expiration: offer.expiration,
      name_retail: offer.retailName,
      address: offer.retailAddress
    },
    html = pug.renderFile(templateDir, params);
  return html;
};

exports.newOffer = (offer, emailTo) => {
  const templateDir = path.join(__dirname, `/emailTemplates/newOffer.pug`),
    params = {
      logo_plink: serviceS3.getUrlEmail('logo_plink'),
      bg_footer: serviceS3.getUrlEmail('bg_footer'),
      bg_general_offer: serviceS3.getUrlEmail('bg_general_offer'),
      logo_bancocolombia: serviceS3.getUrlEmail('logo_bancocolombia'),
      logo_superintendence: serviceS3.getUrlEmail('logo_superintendencia'),
      brand_logo: offer.retailImageUrl || serviceS3.getUrlEmail('ic_default_comercio'),
      ticket: serviceS3.getUrlEmail('ticket'),
      mail_separator: serviceS3.getUrlEmail('mail_separator'),
      img_offer: offer.imageUrl,
      value_strategy: offer.valueStrategy,
      product: offer.product,
      available: offer.maxRedemptions - offer.redemptions,
      max_redemptions: offer.maxRedemptions,
      expiration: offer.expiration,
      name_retail: offer.retailName,
      address: offer.retailAddress,
      name_category: offer.nameCategory.toUpperCase(),
      name_person: offer.name,
      create_code_url: `${config.common.server.base_path}?email=${emailTo}&id=${offer.id}`,
      emailTo,
      offer_id: offer.id
    },
    html = pug.renderFile(templateDir, params);
  return html;
};
exports.offerExpired = offer => {
  const templateDir = path.join(__dirname, `/emailTemplates/offerExpired.pug`),
    params = {
      logo_plink: serviceS3.getUrlEmail('logo_plink'),
      bg_footer: serviceS3.getUrlEmail('bg_footer'),
      bg_expired_general: serviceS3.getUrlEmail('bg_expired_general'),
      bg_general_code: serviceS3.getUrlEmail('bg_general_code'),
      logo_bancocolombia: serviceS3.getUrlEmail('logo_bancocolombia'),
      logo_superintendence: serviceS3.getUrlEmail('logo_superintendencia'),
      brand_logo: offer.retailImageUrl || serviceS3.getUrlEmail('ic_default_comercio'),
      ticket: serviceS3.getUrlEmail('ticket'),
      ic_error_mail: serviceS3.getUrlEmail('ic_error_mail'),
      mail_separator: serviceS3.getUrlEmail('mail_separator'),
      img_offer: offer.imageUrl,
      value_strategy: offer.valueStrategy,
      product: offer.product,
      expiration: offer.expiration,
      name_retail: offer.retailName,
      title: {
        [constants.OFFER_DISABLED]: 'Oferta no disponible',
        [constants.OFFER_FINISHED]: 'Oferta caducada',
        [constants.OFFER_INACTIVE]: 'Oferta no comenzada'
      }[offer.status],
      subtitle: {
        [constants.OFFER_DISABLED]: 'La siguiente oferta ya no está disponible',
        [constants.OFFER_FINISHED]: 'La siguiente oferta ha caducado',
        [constants.OFFER_INACTIVE]: 'La siguiente oferta aun no ha comenzado'
      }[offer.status],
      statusDates: {
        [constants.OFFER_DISABLED]: '',
        [constants.OFFER_FINISHED]: `La oferta caducó: ${offer.expiration}`,
        [constants.OFFER_INACTIVE]: `La oferta comienza: ${offer.begin}`
      }[offer.status],
      address: offer.retailAddress
    },
    html = pug.renderFile(templateDir, params);
  return html;
};
exports.replaceSpecialTags = html => {
  return html
    .replace(/(<!--\[endif\]-->)/g, '<![endif]-->')
    .replace(/(<!--\[if gte mso 9\]-->)/g, '<!--[if gte mso 9]>')
    .replace(/(fffff\")/g, 'fffff"/')
    .replace(/(f1f2f2\")/g, 'f1f2f2"/')
    .replace(/(<\/v:fill>)/g, '');
};
