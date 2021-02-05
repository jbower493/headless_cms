// import dependencies
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const datemaker = require('datemaker');
const morgan = require('morgan');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

// import other files
const db = require('./config/db/db');
const logger = require('./config/logging/winston');
const authRouter = require('./routes/auth/authRouter.js');
const authController = require('./controllers/auth/authController');

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

// initialize mysql session store
const sessionStore = new MySQLStore({}, db);

// initialize sessions
app.use(session({
  name: "session_id",
  genid: (req) => {
    return uuidv4();
  },
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));

// allow cross origin resource sharing, note the default setting allows ANY origin to connect, change this for production
app.use(cors());

// parse json request bodies
app.use(express.json());

// temporary, delete this when front end is built
app.use(express.urlencoded({ extended: false }));

// log http requests
const morganFormat = require('./config/logging/morganFormat');
app.use(morgan(morganFormat, { stream: logger.stream }));

// make logged in user available on req object as req.user
app.use(authController.deserializeUser);

// mount auth router
app.use('/auth', authRouter);

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