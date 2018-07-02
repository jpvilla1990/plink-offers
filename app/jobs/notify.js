const AWS = require('aws-sdk'),
  config = require('../../config'),
  Offer = require('../models').offer,
  Category = require('../models').category,
  logger = require('../logger'),
  emailService = require('../services/mailer'),
  CronJob = require('cron').CronJob,
  sqs = new AWS.SQS(
    new AWS.Config({
      accessKeyId: config.common.aws.key,
      secretAccessKey: config.common.aws.secret,
      region: config.common.aws.region
    })
  ),
  ses = new AWS.SES(
    new AWS.Config({
      accessKeyId: config.common.aws.key,
      secretAccessKey: config.common.aws.secret,
      region: config.common.aws.region
    })
  );

exports.sqs = sqs;
exports.ses = ses;

exports.notify = () => {
  const params = {
    QueueUrl: config.common.aws.queue_url,
    AttributeNames: ['MessageDeduplicationId', 'MessageGroupId'],
    MaxNumberOfMessages: 1,
    VisibilityTimeout: parseInt(config.common.aws.hidden_msg_time)
  };
  logger.info('Beginning process to notify offers');
  return sqs
    .receiveMessage(params)
    .promise()
    .then(data => {
      if (data.Messages) {
        logger.info(`Exist a message in the queue`);
        return Offer.getBy({ id: data.Messages[0].Attributes.MessageDeduplicationId })
          .then(off => {
            logger.info(`Values associated with the offer obtained`);
            const emails = JSON.parse(data.Messages[0].Body).mails;
            ses.getSendQuota({}, function(errQuota, quota) {
              const available = quota.Max24HourSend - quota.SentLast24Hours;
              if (emails.length > available) {
                logger.warn(`The count of emails is greather than daily quota limit`);
              } else {
                off.dataValues.nameCategory = off.category.dataValues.name;
                emails.forEach(element => {
                  emailService
                    .sendNewOffer(off.dataValues, element.mail, element.name)
                    .catch(error => {
                      logger.error(
                        `Didnt send offer with id: ${off.id} to ${element.name} ( ${
                          element.mail
                        } ) because ${error}`
                      );
                    })
                    .then(() => {
                      logger.info(`Sent offer with id: ${off.id} to ${element.name} ( ${element.mail} )`);
                    });
                });
                const deleteParams = {
                  QueueUrl: config.common.aws.queue_url,
                  ReceiptHandle: data.Messages[0].ReceiptHandle
                };
                return sqs
                  .deleteMessage(deleteParams)
                  .promise()
                  .then(() => {
                    logger.error(`Message deleted`);
                    logger.info('End process');
                  })
                  .catch(e => {
                    logger.error(`Error while deleting message from the queue, reason: ${e}`);
                  });
              }
            });
          })
          .catch(e => {
            logger.error(
              `Error when tried to obtain the offer with id: ${
                data.Messages[0].Attributes.MessageDeduplicationId
              }, reason: ${e}`
            );
          });
      } else {
        logger.info('No messages in the queue');
      }
      logger.info('End process');
    })
    .catch(err => {
      logger.error(`Error while receiving message from the queue, reason: ${err}`);
    });
};
exports.jobNotify = new CronJob(config.common.aws.time_nodecron, exports.notify, false, true);
