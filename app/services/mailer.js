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

const NEW_OFFER_NAME_MAIL = '¡ No puedes dejar pasar esta oportunidad !';
const NEW_CODE_NAME_MAIL = 'Aquí tienes tu código para redimir la oferta.';
const EXPIRED_NAME_MAIL = 'Ups! Esta oferta ha expirado.';

exports.transporter = transporter;
exports.ses = ses;
exports.sendNewCode = (offer, code) => {
  return requestService.retail(`/points/${offer.retail}`).then(rv => {
    offer.retailName = rv.commerce.description;
    offer.retailAddres = rv.address;
    const email = {
      subject: NEW_CODE_NAME_MAIL,
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
      subject: EXPIRED_NAME_MAIL,
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
    // const subjectEmail =
    //   name != null
    //     ? i18n.t(`newOffer.subject`)
    //     : `IdOferta=${offer.id} Nit=${rv.commerce.nit} Posids=${postIds.join()}`;
    const subjectEmail = NEW_OFFER_NAME_MAIL;
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
        from: `ofertas@plink.com.co`,
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
