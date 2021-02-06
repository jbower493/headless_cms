// import dependencies
const bcrypt = require('bcrypt');

// import db
const db = require('../../config/db/db');

// import models
const User = require('../../models/user');

// import validators
const validateUser = require('../../validators/auth/validateUser');

// import JSON response helper
const AuthRes = require('../../utils/helpers/authJsonRes');

module.exports = {
  getUser(req, res, next) {
    
    if(req.user) {
      res.json(new AuthRes(null, 'A user is logged in', true, { name: req.user.username }));
    } else {
      res.json(new AuthRes(null, 'No user is logged in', true, null));
    }
  },

  login(req, res, next) {

    const { username, password, role } = req.body;

    const errors = [];

    if(!username || !password || !role) {
      errors.push('Field(s) missing');
    }
    if(typeof username !== 'string' || typeof password !== 'string' || typeof role !== 'string') {
      errors.push('Not strings');
    }

    if(role !== 'user' && role !== 'admin') {
      errors.push('Incorrect role');
    }

    if(errors.length > 0) {
      res.json(new AuthRes(errors[0], '', false, null));
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if(err) {
        throw err;
      }

      if(results.length === 0) {
        res.json(new AuthRes('Incorrect credentials', '', false, null));
      }

      const matches = await bcrypt.compare(password, results[0].password);
      if(matches) {
        req.session.auth = { userId: results[0].id };
        res.json(new AuthRes(null, 'Log in successful', true, { username: results[0].username }));
      } else {
        res.json(new AuthRes('Incorrect credentials', '', false, null));
      }
    });
  },

  logout(req, res, next) {
    if(!req.user) {
      return res.json(new AuthRes('No user is logged in', '', false, null));
    }

    req.session.auth = 0;
    res.json(new AuthRes(null, 'Successfully logged out', true, null));
  },

  deserializeUser(req, res, next) {
    if(req.session.auth && req.session.auth !== 0) {
      db.query('SELECT * FROM users WHERE id = ?', [req.session.auth.userId], (err, results) => {
        if(err) {
          throw err;
        }
        req.user = results[0];
        next();
      });
    } else {
      next();
    }
  }
};