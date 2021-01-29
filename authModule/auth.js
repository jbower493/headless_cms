const bcrypt = require('bcrypt');
const db = require('../config/db/db');

module.exports = {
  login(req, res, next) {

    const { username, password } = req.body;


    if(typeof username !== 'string' || typeof password !== 'string') {
      throw new Error('Not strings');
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if(err) {
        throw err;
      }

      if(results.length === 0) {
        return res.send('User does not exist');
      }

      const matches = await bcrypt.compare(password, results[0].password);
      if(matches) {
        req.session.auth = { userId: results[0].id };
        res.send('Log in successful');
      } else {
        res.send('Wrong password');
      }
    });
  },

  logout(req, res, next) {
    req.session.auth = 0;
    res.send('Logout');
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