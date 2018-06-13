const AWS = require('aws-sdk'),
  config = require('../../config'),
  ses = new AWS.SES(
    new AWS.Config({
      accessKeyId: config.common.aws.key,
      secretAccessKey: config.common.aws.secret,
      region: config.common.aws.region
    })
  );

exports.sendMail = (body, ToAddresses) =>
  ses
    .sendEmail({
      Source: 'martin.picollo@wolox.com.ar',
      Destination: { ToAddresses },
      Message: {
        Body: { Html: { Data: body } },
        Subject: { Data: 'test-plink-mail' }
      }
    })
    .promise();
