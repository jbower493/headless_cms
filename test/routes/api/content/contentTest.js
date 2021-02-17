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
const contentTypeQuery = require('../../../../utils/helpers/query_builders/contentTypeQuery.js');

// use chai http
chai.use(chaiHttp);

describe('API/CONTENT', () => {
  // global variables
  const user1 = {
    username: 'John',
    password: 'johndoe',
    role: 'user'
  };
  const user1Privileges = {
    "create": true,
    "read own": true,
    "read any": true,
    "update own": true,
    "update any": false,
    "delete own": true,
    "delete any": false
  };
  const user1Hash = bcrypt.hashSync(user1.password, saltRounds);
  let user1Id;

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

  const post1 = {
    title: 'Post One Title',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    image_ref: '/images/post-one.jpg'
  };

  const post2 = {
    title: 'A Great Blog Post',
    body: 'Sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
    image_ref: '/images/a-great-blog-post.jpg'
  };

  const newPost = {
    title: 'A New Start',
    body: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet.',
    image_ref: '/images/a-new-start.jpg'
  };

  before(done => {
    // insert regular user into db before all tests
    db.query('INSERT INTO users (username, password, role, privileges) VALUES (?, ?, ? ,?)', [user1.username, user1Hash, user1.role, JSON.stringify(user1Privileges)], (err, results, fields) => {
      if(err) {
        throw err;
      }
      // set user1Id variable for future use after user 1 is inserted into db
      user1Id = results.insertId

      // create posts content type
      db.query(contentTypeQuery.createTable(contentType1), (err, results) => {
        if(err) {
          throw err;
        }
        done();
      });
    });
  });
  after(done => {
    // remove user from db after all tests
    db.query('DELETE FROM users', (err, results) => {
      if(err) {
        throw err;
      }

      // drop posts content type table
      db.query(contentTypeQuery.dropTable(contentType1.name), (err, results) => {
        if(err) {
          throw err;
        }
        done();
      });
    });
  });
  beforeEach(done => {
    // insert the 2 posts into the db before every it block, this statement isn't dynamic so need to change it if the post variables above change!
    db.query(`INSERT INTO posts (title, body, image_ref, owner_id) VALUES (?, ?, ?, ?), (?, ?, ?, ?)`, [post1.title, post1.body, post1.image_ref, user1Id, post2.title, post2.body, post2.image_ref, user1Id], (err, results) => {
      if(err) {
        throw err;
      }
      done();
    });
  });
  afterEach(done => {
    // remove all posts from db after each it block to avoid side effects, this statement isn't dynamic so need to change it if the post variables above change!
    db.query('DELETE FROM posts', (err, results) => {
      done();
    });
  });
  // /*
  // POST /api/content/:name
  // */
  // describe('POST /api/content/:name', () => {
  //   it('', done => {

  //   });
  // });
  // /*
  // GET /api/content/:name/:id
  // */
  // describe('GET /api/content/:name/:id', () => {
  //   it('', done => {

  //   });
  // });
  // /*
  // PUT /api/content/:name/:id
  // */
  // describe('PUT /api/content/:name/:id', () => {
  //   it('', done => {

  //   });
  // });
  // /*
  // DELETE /api/content/:name/:id
  // */
  // describe('DELETE /api/content/:name/:id', () => {
  //   it('', done => {

  //   });
  // });

  // /*
  // GET /api/content/all/:name
  // */
  // describe('GET /api/content/all/:name', () => {
  //   it('', done => {

  //   });
  // });
  // /*
  // DELETE /api/content/all/:name
  // */
  // describe('GET /api/content/all/:name', () => {
  //   it('', done => {

  //   });
  // });

});