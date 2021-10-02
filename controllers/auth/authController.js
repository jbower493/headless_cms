// import dependencies
const bcrypt = require('bcrypt');

// import db
const db = require('../../config/db/db');

// import validators
const validateUser = require('../../validators/validateUser');

// import JSON response helper
const AuthRes = require('../../utils/helpers/authJsonRes');

// import models
const User = require('../../models/User');

module.exports = {
  adminExists(req, res, next) {
    db.query('SELECT username FROM users WHERE role = "admin"', (err, results) => {
      if(err) {
        return next(err);
      }
      
      if(results.length === 0) {
        res.json({ adminExists: false });
      } else if(results.length > 1) {
        next('More than 1 admin exists in the database!');
      } else {
        res.json({ adminExists: true });
      }
    });
  },

  createAdmin(req, res, next) {
    const { username, password } = req.body;

    const privileges = {
      "create": true,
      "read own": true,
      "read any": true,
      "update own": true,
      "update any": true,
      "delete own": true,
      "delete any": true
    };

    const newUser = new User(username, password, 'admin', privileges);
    const validated = validateUser(newUser);

    if(validated !== true) {
      return res.status(400).json(new AuthRes(validated, '', false, null));
    }

    const hash = bcrypt.hashSync(password, 10);
    db.query('INSERT INTO users (username, password, role, privileges) VALUES (?, ?, ?, ?)', [username, hash, 'admin', JSON.stringify(privileges)], (err, results) => {
      if (err) {
        return next(err);
      }
      res.json(new AuthRes(null, 'Admin successfully created', true, null));
    });
  },

  getUser(req, res, next) {
    if(req.user) {
      res.json(new AuthRes(null, 'A user is logged in', true, { username: req.user.username, role: req.user.role }));
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
      return res.json(new AuthRes(errors[0], '', false, null));
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if(err) {
        throw err;
      }

      if(results.length === 0) {
        return res.json(new AuthRes('Incorrect credentials', '', false, null));
      }

      if(results[0].role !== role) {
        return res.json(new AuthRes('Incorrect credentials', '', false, null));
      }

      try {
        const matches = await bcrypt.compare(password, results[0].password);
        if(matches) {
          req.session.auth = { userId: results[0].id };
          res.json(new AuthRes(null, 'Log in successful', true, { username: results[0].username, role: results[0].role }));
        } else {
          res.json(new AuthRes('Incorrect credentials', '', false, null));
        }
      } catch(err) {
        next(err);
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