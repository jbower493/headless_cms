// import dependencies
const bcrypt = require('bcrypt');

// import db
const db = require('../../../config/db/db');

// import validators
const validateUser = require('../../../validators/auth/validateUser');

// import JSON response helper
const UserRes = require('../../../utils/helpers/userJsonRes');

// import models
const User = require('../../../models/User');

module.exports = {
  createUser(req, res, next) {
    const { username, password, role } = req.body;

    const newUser = new User(username, password, role);
    const validated = validateUser(newUser);

    if(validated !== true) {
      return res.status(400).json(new UserRes(validated, '', false, null));
    }

    db.query('SELECT username FROM users WHERE username = ?', [username], (err, results) => {
      if(err) {
        return next(err);
      }
      if(results.length > 0) {
        return res.json(new UserRes('Username already in use', '', false, null));
      }
      const hash = bcrypt.hashSync(password, 10);
      db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role], (err, results) => {
        if(err) {
          return next(err);
        }
        res.json(new UserRes(null, 'User successfully created', true, null));
      });
    });
  },

  getUser(req, res, next) {    
    db.query('SELECT id, username, role FROM users WHERE id = ?', [req.params.id], (err, results) => {
      if(err) {
        return next(err);
      }
      if(results.length === 0) {
        res.json(new UserRes('No user exists with this id', '', false, null));
      } else {
        res.json(new UserRes(null, 'User successfully fetched', true, results[0]));
      }
    });
  }
};