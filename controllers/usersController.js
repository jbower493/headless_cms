// import models
const User = require('../models/user');

// import validator
const validateUser = require('../validators/validateUser');

module.exports = {
  test(req, res, next) {
    // get this from req, not bilbo baggins
    const bilbo = new User('Bilbo', 'Baggins');
    
    if(validateUser(bilbo) !== true) {
      // send back error and do nothing
      return res.json({ error: 'User failed validation' });
    }

    // do user logic and send back OK response
    res.json({ message: 'This is the /users route' });
  }
};