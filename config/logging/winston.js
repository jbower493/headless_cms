const winston = require('winston');

// define transports
let transports;
if(process.env.NODE_ENV === 'production') {
  transports = [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ];
} else if(process.env.NODE_ENV === 'dev') {
  transports = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ];
} else {
  transports = [
    new winston.transports.Console({ level: 'error' })
  ];
}

// creates a new Winston Logger
const logger = new winston.createLogger({
  level: 'info',
  transports,
  exitOnError: false
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  },
};

module.exports = logger;