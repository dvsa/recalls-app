require('../../src/logger/loggerFactory').initialize(
  {
    use: () => {},
  },
  null,
  {
    appName: 'tests',
    logLevel: 'debug',
  },
);
