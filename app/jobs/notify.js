const AWS = require('aws-sdk'),
  config = require('../../config'),
  Offer = require('../models').offer,
  logger = require('../logger'),
  emailService = require('../services/mailer'),
  CronJob = require('cron').CronJob,
  sqs = new AWS.SQS(
    new AWS.Config({
      accessKeyId: config.common.aws.key,
      secretAccessKey: config.common.aws.secret,
      region: config.common.aws.region
    })
  );

const notify = () => {
  const params = {
    QueueUrl: config.common.aws.queue_url,
    AttributeNames: ['MessageDeduplicationId', 'MessageGroupId'],
    MaxNumberOfMessages: 1
  };
  sqs.receiveMessage(params, function(err, data) {
    if (err) {
      logger.info(err);
    } else {
      if (data.Messages) {
        return Offer.getBy({ id: data.Messages[0].Attributes.MessageDeduplicationId }).then(off => {
          const emails = JSON.parse(data.Messages[0].Body).mails;
          emails.forEach(element => {
            emailService.sendNewOffer(off.dataValues, element.mail, element.name).catch(console.log);
          });
        });
      }
      // return Offer.getBy({id: data[]})
    }
  });
};

module.exports = new CronJob('* * * * * *', notify, false, true);
