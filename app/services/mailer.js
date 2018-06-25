const AWS = require('aws-sdk'),
  nodemailer = require('nodemailer'),
  logger = require('../logger'),
  Offer = require('../models').offer,
  config = require('../../config'),
  pug = require('pug'),
  serviceS3 = require('../services/s3'),
  htmlService = require('../services/html'),
  path = require('path'),
  Email = require('email-templates'),
  i18n = require('i18next'),
  i18next = require('../services/i18next'),
  ses = new AWS.SES(
    new AWS.Config({
      accessKeyId: config.common.aws.key,
      secretAccessKey: config.common.aws.secret,
      region: config.common.aws.region
    })
  ),
  transporter = nodemailer.createTransport({
    SES: ses
  });

exports.transporter = transporter;

exports.sendEmail = (type, offer, code) => {
  return i18next.init().then(t => {
    return new Promise((resolve, reject) => {
      templateDir = path.join(__dirname, `/emailTemplates/${type}.pug`),
        params = {
          logo_plink: serviceS3.getUrlEmail('logo_plink'),
          bg_footer: serviceS3.getUrlEmail('bg_footer'),
          bg_general_code: serviceS3.getUrlEmail('bg_general_code'),
          logo_bancocolombia: serviceS3.getUrlEmail('logo_bancocolombia'),
          logo_superintendencia: serviceS3.getUrlEmail('logo_superintendencia'),
          brand_logo: serviceS3.getUrlEmail('brand_logo'),
          ticket: serviceS3.getUrlEmail('ticket'),
          value_strategy: offer.valueStrategy,
          product: offer.product,
          code: code.code,
          available: offer.maxRedemptions - offer.redemptions,
          expiration: offer.expiration
        },
        subjectEmail = i18n.t(`${type}.subject`),
        html = pug.renderFile(templateDir, params);

      transporter.sendMail(
        {
          from: `no-reply@plink.com.co`,
          to: code.email,
          subject: subjectEmail,
          html: html
        },
        (err, info) => {
          if (err) reject(err);
          resolve(info);
        }
      );
    });
  });
};
