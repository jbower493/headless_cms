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
  /*
  POST /api/content/:name
  */
  describe('POST /api/content/:name', () => {
    it('should return 403 and an error if not logged in as at least a regular user before trying to create a new content type', done => {
      chai.request(server)
        .post(`/api/content/${contentType1.name}`)
        .send(newPost)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body.error).to.equal('Access denied');
          expect(res.body.success).to.be.false;
          done();
        })
    });
    it('should return error: Name param must be a valid content type name if name param contains bad chars', done => {
      const agent = chai.request.agent(server);
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/content/no-specialcharsORnumb3rs')
            .send(post1)
            .end((err, res) => {
              expect(res).to.have.status(400);
              expect(res.body.error).to.equal('Name param must be a valid content type name');
              expect(res.body.success).to.be.false;
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should return error: Content type does not exist if the provided name is not a content type', done => {
      const agent = chai.request.agent(server);
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/content/elephant')
            .send(post1)
            .end((err, res) => {
              expect(res).to.have.status(400);
              expect(res.body.error).to.equal('Content type does not exist');
              expect(res.body.success).to.be.false;
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should return an error and success: false if the new content object does not pass validation', done => {
      const invalidPost = {
        title: ['N', 'O', 'T', 'T', 'E', 'X', 'T'],
        body: 12345,
        image_ref: 'dont_blame_me.jpg'
      };

      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post(`/api/content/${contentType1.name}`)
            .send(invalidPost)
            .end((err, res) => {
              expect(res).to.have.status(400);
              expect(res.body.error).to.be.a('string');
              expect(res.body.success).to.be.false;
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should return success: true and message: Content successfully created if successful', done => {
      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post(`/api/content/${contentType1.name}`)
            .send(newPost)
            .end((err, res) => {
              expect(res.body.message).to.equal('Content successfully created');
              expect(res.body.success).to.be.true;
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('new content should be present in the DB if successful', done => {
      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post(`/api/content/${contentType1.name}`)
            .send(newPost)
            .end((err, res) => {
              
              // query not fully dynamic so make sure to change it if content type in test is no longer post
              db.query(`SELECT * FROM posts WHERE title = ?`, [newPost.title], (err, results) => {
                if(err) {
                  throw err;
                }
                expect(results.length).to.equal(1);
                expect(results[0].title).to.equal(newPost.title);
                expect(results[0].body).to.equal(newPost.body);
                expect(results[0].image_ref).to.equal(newPost.image_ref);
                agent.close(err => {
                  done();
                })
              });
            })
        })
    });
  });
  
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