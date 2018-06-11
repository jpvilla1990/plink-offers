exports.config = {
  environment: 'testing',
  isTesting: true,
  common: {
    database: {
      name: process.env.DB_NAME_TEST,
      host: process.env.DB_HOST_TEST,
      port: process.env.DB_PORT_TEST,
      username: process.env.DB_USERNAME_TEST,
      password: process.env.DB_PASSWORD_TEST
    },
    session: {
      secret: 'some-super-secret',
      algorithm: 'HS256'
    }
  }
};
