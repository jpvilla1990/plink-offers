const AWS = require('aws-sdk'),
  config = require('../../config'),
  Offer = require('../models').offer,
  UserOffer = require('../models').user_offer,
  logger = require('../logger'),
  md5 = require('md5'),
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

const deleteMessage = data => {
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
};
exports.creatorUserOffer = () => {
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
            logger.info(`Values associated with the offer (id : ${off.dataValues.id}) obtained`);
            const emails = JSON.parse(data.Messages[0].Body).mails;
            emails.forEach(element => {
              UserOffer.createModel({
                hashEmail: md5(element.mail),
                email: element.mail,
                offerId: off.dataValues.id
              })
                .then(() => {
                  logger.info(
                    `The user was created with email: ${element.mail}
                               associated with the offer id: ${off.dataValues.id}`
                  );
                })
                .catch(error => {
                  logger.error(
                    `The user was not create with email : ${element.mail} because ${error.message}`
                  );
                });
            });
            return deleteMessage(data);
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
exports.jobCreator = new CronJob(config.common.aws.time_nodecron, exports.creatorUserOffer, false, true);
