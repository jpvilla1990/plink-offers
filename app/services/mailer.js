const AWS = require('aws-sdk'),
  nodemailer = require('nodemailer'),
  logger = require('../logger'),
  Offer = require('../models').offer,
  config = require('../../config'),
  servicesHtml = require('../services/html'),
  pug = require('pug'),
  serviceS3 = require('../services/s3'),
  path = require('path'),
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

exports.sendNewCode = (offer, code) => {
  return i18next.init().then(t => {
    const email = {
      subject: i18n.t(`newCode.subject`),
      html: servicesHtml.newCode(offer, code),
      to: code.email
    };
    return exports.sendEmail(email);
  });
};

exports.sendEmail = email => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from: `no-reply@plink.com.co`,
        to: email.to,
        subject: email.subject,
        html: email.html
      },
      (err, info) => {
        if (err) reject(err);
        resolve(info);
      }
    );
  });
};
