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
    code_offer_length: process.env.CODE_OFFER_LENGTH || 4,
    server: {
      base_path: process.env.URL_SERVER_API,
      info_retail: process.env.URL_INFO_RETAIL,
      email_new_offer: process.env.EMAIL_OFFER,
      email_plink: process.env.EMAIL_PLINK,
      count_mask_mail: process.env.COUNT_MASK_MAIL || 4,
      info_pos_id: process.env.URL_INFO_POS_ID
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
    zendesk: {
      group_name: process.env.ZENDESK_GROUP_NAME,
      api: {
        host: process.env.ZENDESK_API_HOST,
        token: process.env.ZENDESK_API_TOKEN
      }
    },
    aws: {
      key: process.env.KEY_AWS,
      secret: process.env.SECRET_AWS,
      region: process.env.REGION_AWS,
      bucket: process.env.BUCKET_AWS,
      bucket_email: process.env.BUCKET_EMAIL,
      expiration: process.env.EXPIRATION_AWS,
      url_s3: process.env.URL_S3_EMAIL,
      folder_s3: process.env.FOLDER_BUCKET_EMAIL,
      group_id: process.env.GROUP_ID,
      rate_transport: process.env.SENDING_RATE,
      pool_id_users_app: process.env.BACK_USERS_POOL_ID,
      s3SignatureVersion: process.env.SIGNATURE_VERSION_S3 || 'v4',
      offers_images_cdn: process.env.OFFERS_IMAGES_CDN || 'images-offers-dev.plink.com.co'
    },
    environment: process.env.NODE_ENV
  }
};

const customConfig = require(configFile).config;
module.exports = assignObject(customConfig, config);
