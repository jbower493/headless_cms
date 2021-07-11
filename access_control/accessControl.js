// import db
const db = require('../config/db/db');

module.exports = {
  noUsers(req, res, next) {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.length > 0) {
        return res.status(403).json({ error: 'Access denied', success: false });
      }
      next();
    })
  },

  notLoggedIn(req, res, next) {
    if(req.user) {
      res.status(403).json({ error: "Access denied", success: false });
    } else {
      next();
    }
  },

  loggedInUser(req, res, next) {
    if(req.user) {
      next();
    } else {
      res.status(403).json({ error: "Access denied", success: false });
    }
  },

  loggedInAdmin(req, res, next) {
    if(req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: "Access denied", success: false });
    }
  },

  authenticatedUser(req, res, next) {
    // this is only for the read routes as authentication could be via a token instead of being logged in
  }
};