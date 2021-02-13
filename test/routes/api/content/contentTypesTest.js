// import dependencies
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

// salt rounds for any bcrypt hashes
const saltRounds = 10;

// create db connection to test db, can't import this from server or it throws some handshake error
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'headless_cms_test'
});

// import server
const server = require('../../../../server');

// import query builder
const query = require('../../../../utils/helpers/query_builders/createContentType');

// use chai http
chai.use(chaiHttp);

describe('API/CONTENT_TYPES', () => {
  const admin1 = {
    username: 'Bilbo',
    password: 'baggins',
    role: 'admin',
  };
  const adminPrivileges = {
    "create": true,
    "read own": true,
    "read any": true,
    "update own": true,
    "update any": true,
    "delete own": true,
    "delete any": true
  };
  const admin1Hash = bcrypt.hashSync(admin1.password, saltRounds);

  const contentType1 = {
    name: 'post',
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true
      },
      {
        name: 'body',
        type: 'text',
        required: true
      },
      {
        name: 'image_ref',
        type: 'text',
        required: false
      }
    ]
  };

  // insert the admin user before all tests
  before(done => {
    db.connect(err => {
      if(err) {
        throw err;
      }
      db.query('INSERT INTO users (username, password, role, privileges) VALUES (?, ?, ?, ?)', [admin1.username, admin1Hash, admin1.role, JSON.stringify(adminPrivileges)], (err, results) => {
        if(err) {
          throw err;
        }
        done();
      });
    });
  });
  // clear all users after all tests
  after(done => {
    db.query('DELETE FROM users', (err, results) => {
      if(err) {
        throw err;
      }
      db.end(err => {
        if(err) {
          throw err;
        }
        done();
      });
    });
  });
  // add post content type before every it block
  beforeEach(done => {
    db.query(query.sql(contentType1), query.params(contentType1), (err, results) => {
      if(err) {
        throw err;
      }
      done();
    });
  });
  // remove post content type after every it block so it can be put back to its original state by the beforeEach hook
  afterEach(done => {
    db.query('DROP TABLE posts', (err, results) => {
      if(err) {
        throw err;
      }
      done();
    });
  });
  it('tester', () => {
    expect(true).to.be.true;
  });
});