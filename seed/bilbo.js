require('dotenv').config();
const db = require('../config/db/dbDev');
const bcrypt = require('bcrypt');

db.query('INSERT INTO users (username, password, role) VALUES ("Bilbo", ?, "user")', [
  bcrypt.hashSync('baggins', 10)
], (err, results) => {
  if(!err) console.log('Baggins is in there');
  if(err) console.log(err);
});