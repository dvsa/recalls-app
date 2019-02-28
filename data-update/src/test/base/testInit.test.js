require('cvr-common/src/logger/loggerFactory').initialize({
  use: () => {},
}, {
  get: () => {},
},
{
  appName: 'debug',
  logLevel: 'debug',
});
