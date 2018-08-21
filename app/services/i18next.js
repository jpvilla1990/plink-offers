const i18next = require('i18next'),
  path = require('path'),
  Backend = require('i18next-node-fs-backend');

exports.init = () => {
  return new Promise((resolve, reject) => {
    i18next.use(Backend).init(
      {
        lng: 'es',
        fallbackLng: 'es',
        backend: {
          loadPath: path.join(__dirname, '/locales/es.json')
        }
      },
      (err, t) => {
        if (err) return reject(err);
        resolve(t);
      }
    );
  });
};
