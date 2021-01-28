// import dependencies
const express = require('express');
const session = require('express-session');
const datemaker = require('datemaker');
const morgan = require('morgan');
require('dotenv').config();

// import config objects
const db = require('./config/db/db');
const logger = require('./config/logging/winston');

// define app and port
const app = express();
const PORT = process.env.PORT;

// connect to DB
db.connect(err => {
  if(err) {
    return logger.error(err.stack);
  }
  logger.info(`${process.env.NODE_ENV} database connected`);
});

// log http requests
const morganFormat = require('./config/logging/morganFormat');
app.use(morgan(morganFormat, { stream: logger.stream }));


// base route
app.get('/', (req, res, next) => {
  res.json({ message: 'Headless CMS project' });
});

// 404 response
app.use((req, res, next) => {
  res.json({ message: 'No route exists' });
});

// error handler
app.use((err, req, res, next) => {
  logger.error(`[${datemaker.UTC()}] [${req.method}] [${req.originalUrl}] [${req.ip}] [${err.stack}]`);
  res.json({ error: true });
});


// run the app
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

// export the app for testing
module.exports = app;