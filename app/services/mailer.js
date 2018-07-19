const AWS = require('aws-sdk'),
  nodemailer = require('nodemailer'),
  config = require('../../config'),
  requestService = require('../services/request'),
  servicesHtml = require('../services/html'),
  i18n = require('i18next'),
  { MAX_LENGTH_OFFER_DETAIL } = require('../constants'),
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

const sanitizeMaxString = (string, maxLength = MAX_LENGTH_OFFER_DETAIL) =>
  string && string.length > maxLength ? `${string.substring(0, maxLength)}...` : string;

exports.transporter = transporter;
exports.ses = ses;

const getInfoMail = (offer, type, name = null) => {
  return requestService.retail(`/points/${offer.retail}`).then(rv => {
    offer.retailName = sanitizeMaxString(rv.commerce.description);
    offer.retailAddress = sanitizeMaxString(rv.address);
    offer.nameCategory = offer.nameCategory ? offer.nameCategory.toUpperCase() : null;
    offer.name = name != null ? name : '';
    if (name === null && type !== 'newOffer') {
      offer.subjectEmail = i18n.t(`${type}.subject`);
    } else {
      const postIds = new Array();
      rv.posTerminals.map(value => postIds.push(value.posId));
      offer.subjectEmail = `IdOferta=${offer.id} Nit=${rv.commerce.nit} Posids=${postIds.join()}`;
    }
    return Promise.resolve();
  });
};

exports.sendNewCode = (offer, code) => {
  return getInfoMail(offer, 'newCode').then(() => {
    const email = {
      subject: offer.subjectEmail,
      html: servicesHtml.newCode(offer, code),
      to: code.email
    };
    return exports.sendEmail(email);
  });
};

exports.sendOfferExpired = (offer, code) => {
  return getInfoMail(offer, 'offerExpired').then(() => {
    const email = {
      subject: offer.subjectEmail,
      html: servicesHtml.offerExpired(offer, code),
      to: code.email
    };
    return exports.sendEmail(email);
  });
};

exports.sendNewOffer = (offer, mail, name = null) => {
  return getInfoMail(offer, 'newOffer').then(() => {
    const email = {
      subject: offer.subjectEmail,
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
        from: config.common.server.email_plink,
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
