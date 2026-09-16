const {exec} = require('child_process');
const {logger} = require('@ucd-lib/fin-service-utils');

module.exports = function (command, args={}, options={}) {
  if( !args.shell ) {
    args.shell = '/bin/bash';
  }

  return new Promise((resolve, reject) => {
    logger.debug('exec start', command, args);
    let proc = exec(command, args, (error, stdout, stderr) => {
      logger.debug('exec complete', command);

      if (error) {
        reject(error);
        return;
      }

      resolve({stdout, stderr});
    });

    if (options.input) {
      proc.stdin.write(options.input);
      proc.stdin.end();
    }
  });
}