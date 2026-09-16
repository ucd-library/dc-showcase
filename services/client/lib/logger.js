const { createLogger, logReqMiddleware } = require('@ucd-lib/logger');

const logger = createLogger({
  name: 'dcf',
  noInitMsg: true
});

module.exports = { logger, logReqMiddleware, createLogger };
