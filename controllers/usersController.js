// import models
const User = require('../models/user');

module.exports = {
  test(req, res, next) {

    const bilbo = new User('Bilbo', 'Baggins');
    console.log(bilbo);

    res.json({ message: 'This is the /users route' });
  }
};