require('dotenv').config();
const db = require('../../config/db/dbDev');
const bcrypt = require('bcrypt');

const adminPrivileges = {
  "create": true,
  "read own": true,
  "read any": true,
  "update own": true,
  "update any": true,
  "delete own": true,
  "delete any": true
};

db.query('INSERT INTO users (username, password, role, privileges) VALUES ("Bilbo", ?, "user", ?)', [bcrypt.hashSync('baggins', 10), JSON.stringify(adminPrivileges)], (err, results) => {
  if(!err) console.log('Baggins is in there');
  if(err) console.log(err);
  db.end(err => {
    if (err) {
      throw err;
    }
    console.log('DB connection closed')
  })
});