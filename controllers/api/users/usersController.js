// import dependencies
const bcrypt = require('bcrypt');

// import db
const db = require('../../../config/db/db');

// import validators
const validateUser = require('../../../validators/auth/validateUser');

// import models
const User = require('../../../models/User');

module.exports = {
  createUser(req, res, next) {
    const { username, password, role } = req.body;

    const newUser = new User(username, password, role);
    const validated = validateUser(newUser);

    if(validated !== true) {
      return res.status(400).json({
        error: validated,
        message: '',
        success: false
      });
    }

    db.query('SELECT username FROM users WHERE username = ?', [username], (err, results) => {
      if(err) {
        return next(err);
      }
      if(results.length > 0) {
        return res.json({
          error: 'Username already in use',
          message: '',
          success: false
        });
      }
      const hash = bcrypt.hashSync(password, 10);
      db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role], (err, results) => {
        if(err) {
          return next(err);
        }
        res.json({
          error: null,
          message: 'User successfully created',
          success: true
        });
      });
    });
  },

  getUser(req, res, next) {
    
  }
};