const { createLogger, logReqMiddleware } = require('@ucd-lib/logger');

const logger = createLogger({
  name: 'dcs-gateway',
  noInitMsg: true
});

module.exports = { logger, logReqMiddleware, createLogger };
