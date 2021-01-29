// import models
const User = require('../models/user');

// import validator
const validateUser = require('../validators/cms/validateUser');

module.exports = {
  getUser(req, res, next) {
    
    if(req.user) {
      res.json({
        message: 'A user is logged in',
        user: { name: 'John Doe' }
      });
    } else {
      res.json({
        message: 'No user is logged in',
        user: null
      });
    }
  }
};