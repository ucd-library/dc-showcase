import { createLogger, logReqMiddleware } from '@ucd-lib/logger';

const logger = createLogger({
  name: 'dcs-gateway',
  noInitMsg: true
});

export { logger, logReqMiddleware, createLogger };
