const ENVIRONMENT = process.env.NODE_ENV || 'development';

if (ENVIRONMENT !== 'production') {
  require('dotenv').config();
}

const configFile = `./${ENVIRONMENT}`;

const isObject = variable => {
  return variable instanceof Object;
};

/*
 * Deep copy of source object into tarjet object.
 * It does not overwrite properties.
*/
const assignObject = (target, source) => {
  if (target && isObject(target) && source && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(target, key)) {
        target[key] = source[key];
      } else {
        assignObject(target[key], source[key]);
      }
    });
    return target;
  }
};

const config = {
  common: {
    timezone: process.env.TIME_ZONE || 'America/Bogota',
    server: {
      info_retail: process.env.URL_INFO_RETAIL,
      email_new_offer: process.env.EMAIL_OFFER
    },
    database: {
      url: process.env.NODE_API_DB_URL,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    },
    api: {
      bodySizeLimit: process.env.API_BODY_SIZE_LIMIT,
      parameterLimit: process.env.API_PARAMETER_LIMIT
    },
    session: {
      header_name: 'authorization',
      secret: process.env.NODE_API_SESSION_SECRET,
      algorithm: 'RSA256'
    },
    rollbar: {
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      environment: process.env.ROLLBAR_ENV
    },
    aws: {
      key: process.env.KEY_AWS,
      secret: process.env.SECRET_AWS,
      region: process.env.REGION_AWS,
      bucket: process.env.BUCKET_AWS,
      bucket_email: process.env.BUCKET_EMAIL,
      expiration: process.env.EXPIRATION_AWS,
      url_s3: process.env.URL_S3_EMAIL,
      folder_s3: process.env.FOLDER_BUCKET_EMAIL
    }
  }
};

const customConfig = require(configFile).config;
module.exports = assignObject(customConfig, config);
