const AWS = require('aws-sdk'),
  nodemailer = require('nodemailer'),
  config = require('../../config'),
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
  }),
  constants = require('../constants'),
  { moment } = require('../utils');

const getDataFromCommerce = (offer, dataCommerce, nameCategory) => ({
  ...offer,
  retailName: dataCommerce.commerce.description,
  retailAddress: dataCommerce.address,
  nameCategory: nameCategory.toUpperCase()
});
exports.transporter = transporter;
exports.ses = ses;

exports.sendNewCode = ({ offer, code, dataCommerce, nameCategory }) => {
  const infoMail = getDataFromCommerce(offer, dataCommerce, nameCategory),
    email = {
      subject: i18n.t(`${constants.NEW_CODE}.subject`),
      html: servicesHtml.newCode(infoMail, code),
      to: code.email
    };
  return exports.sendEmail(email);
};
exports.sendOfferExpired = ({ offer, code, dataCommerce, nameCategory }) => {
  const beforeBegin = moment().isBefore(moment(offer.begin).startOf('day')),
    status = beforeBegin ? constants.BEFORE_BEGIN : constants.OFFER_EXPIRED,
    infoMail = getDataFromCommerce(offer, dataCommerce, nameCategory);
  infoMail.beforeBegin = beforeBegin;
  const email = {
    subject: i18n.t(`${status}.subject`),
    html: servicesHtml.offerExpired(infoMail, code),
    to: code.email
  };
  return exports.sendEmail(email);
};
exports.sendNewOffer = ({ offer, mail, name, dataCommerce, nameCategory }) => {
  const infoMail = getDataFromCommerce(offer, dataCommerce, nameCategory);
  if (!name) {
    const postIds = dataCommerce.posTerminals.map(value => value.posId);
    infoMail.subject = `IdOferta=${offer.id} Nit=${offer.nit} Posids=${postIds.join()}`;
  } else {
    infoMail.name = name;
    infoMail.subject = i18n.t(`${constants.NEW_OFFER}.subject`);
  }
  const email = {
    subject: infoMail.subject,
    html: servicesHtml.newOffer(infoMail, mail),
    to: mail
  };
  return exports.sendEmail(email);
};
exports.sendEmail = email => {
  email.html = servicesHtml.replaceSpecialTags(email.html);
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
