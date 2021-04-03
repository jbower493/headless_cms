// import dependencies
const bcrypt = require('bcrypt');

// import db
const db = require('../../../config/db/db');

// import validators
const validateUser = require('../../../validators/validateUser');

// import JSON response helper
const UserRes = require('../../../utils/helpers/userJsonRes');

// import models
const User = require('../../../models/User');

module.exports = {
  createUser(req, res, next) {
    const { username, password, role, privileges } = req.body;

    const newUser = new User(username, password, role, privileges);
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
      db.query('INSERT INTO users (username, password, role, privileges) VALUES (?, ?, ?, ?)', [username, hash, role, JSON.stringify(privileges)], (err, results) => {
        if(err) {
          return next(err);
        }
        res.json(new UserRes(null, 'User successfully created', true, null));
      });
    });
  },

  getUser(req, res, next) {    
    db.query('SELECT id, username, role, privileges FROM users WHERE id = ?', [req.params.id], (err, results) => {
      if(err) {
        return next(err);
      }
      if(results.length === 0) {
        res.json(new UserRes('No user exists with this id', '', false, null));
      } else {
        results[0].privileges = JSON.parse(results[0].privileges);
        res.json(new UserRes(null, 'User successfully fetched', true, results[0]));
      }
    });
  },

  updateUser(req, res, next) {
    const { username, password, role, privileges } = req.body;

    const alteredUser = new User(username, password, role, privileges);
    const validated = validateUser(alteredUser);

    if(validated !== true) {
      return res.status(400).json(new UserRes(validated, '', false, null));
    }

    const hash = bcrypt.hashSync(password, 10);

    db.query('UPDATE users SET username = ?, password = ?, role = ?, privileges = ? WHERE id = ?', [username, hash, role, JSON.stringify(privileges), req.params.id], (err, results) => {
      if(err) {
        return next(err);
      }
      if(results.affectedRows === 0) {
        return res.json(new UserRes('No user exists with this id', '', false, null));
      }
      res.json(new UserRes(null, 'User successfully updated', true, null));
    });
  },

  deleteUser(req, res, next) {
    db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, results) => {
      if(err) {
        return next(err);
      }
      if(results.affectedRows === 0) {
        return res.json(new UserRes('No user exists with this id', '', false, null));
      }
      res.json(new UserRes(null, 'User successfully deleted', true, null));
    });
  },

  getAllUsers(req, res, next) {
    db.query('SELECT id, username, role, privileges FROM users WHERE role = "user"', (err, results) => {
      if(err) {
        return next(err);
      }
      res.json({
        error: null,
        message: 'All users successfully fetched',
        success: true,
        users: results
      });
    });
  }
};