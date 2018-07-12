const AWS = require('aws-sdk'),
  nodemailer = require('nodemailer'),
  config = require('../../config'),
  requestService = require('../services/request'),
  servicesHtml = require('../services/html'),
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
    SES: ses,
    sendingRate: config.common.aws.rate_transport
  });

exports.transporter = transporter;
exports.ses = ses;
exports.sendNewCode = (offer, code) => {
  return requestService.retail(`/points/${offer.retail}`).then(rv => {
    offer.retailName = rv.commerce.description;
    offer.retailAddres = rv.address;
    const email = {
      subject: i18n.t(`newCode.subject`),
      html: servicesHtml.newCode(offer, code),
      to: code.email
    };
    return exports.sendEmail(email);
  });
};

exports.sendOfferExpired = (offer, code) => {
  return requestService.retail(`/points/${offer.retail}`).then(rv => {
    offer.retailName = rv.commerce.description;
    offer.retailAddres = rv.address;
    const email = {
      subject: i18n.t(`offerExpired.subject`),
      html: servicesHtml.offerExpired(offer),
      to: code.email
    };
    return exports.sendEmail(email);
  });
};

exports.sendNewOffer = (offer, mail, name = null) => {
  return requestService.retail(`/points/${offer.retail}`).then(rv => {
    const postIds = new Array();
    rv.posTerminals.map(value => postIds.push(value.posId));
    offer.retailName = rv.commerce.description;
    offer.retailAddres = rv.address;
    offer.name = name != null ? name : '';
    offer.nameCategory = offer.nameCategory.toUpperCase();
    const subjectEmail =
      name != null
        ? i18n.t(`newOffer.subject`)
        : `IdOferta=${offer.id} Nit=${rv.commerce.nit} Posids=${postIds.join()}`;
    const email = {
      subject: subjectEmail,
      html: servicesHtml.newOffer(offer, mail),
      to: mail
    };
    return exports.sendEmail(email);
  });
};

exports.sendEmail = email => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from: `ofertas@plink.com`,
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
