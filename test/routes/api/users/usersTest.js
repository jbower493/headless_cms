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

// use chai http
chai.use(chaiHttp);

describe('API/USERS', () => {
  const admin1 = {
    username: 'Bilbo',
    password: 'baggins',
    role: 'admin'
  };
  const admin1Hash = bcrypt.hashSync(admin1.password, saltRounds);

  const user1 = {
    username: 'John',
    password: 'johndoe',
    role: 'user'
  };
  const user1Hash = bcrypt.hashSync(user1.password, saltRounds);

  before(done => {
    // insert the admin user before all tests
    db.connect(err => {
      if(err) {
        throw err;
      }
      db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [admin1.username, admin1Hash, admin1.role], (err, results) => {
        if(err) {
          throw err;
        }
        done();
      });
    });
  });
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
  beforeEach(done => {
    // add a non admin user to the db before each describe block
    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [user1.username, user1Hash, user1.role], (err, results) => {
      if(err) {
        throw err;
      }
      done();
    });
  });
  afterEach(done => {
    // remove all non admin users before the next test in order to avoid unwanted side effects
    db.query('DELETE FROM users WHERE role != "admin"', (err, results) => {
      if(err) {
        throw err;
      }
      done();
    });
  });
  /*
    POST /api/user
    ACCESS: logged in ADMIN
  */
  describe('POST /api/user', () => {
    it('should return 403 and an error if not logged in as admin before trying to create new user', done => {
      const newUser = {
        username: 'Fred',
        password: 'fredfred',
        role: 'user'
      };

      chai.request(server)
        .post('/api/user')
        .send(newUser)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body.error).to.equal('Access denied');
          expect(res.body.success).to.be.false;
          done();
        })
    });
    it('should return an error and success: false if the new user object does not pass validation', done => {
      const invalidUser = {
        username: 'Fred',
        password: 'fre',
        role: 'user'
      };

      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/user')
            .send(invalidUser)
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
    it('should return an error and success: false if the username is already in use', done => {
      const alreadyTakenUser = {
        username: user1.username,
        password: 'fredfred',
        role: 'user'
      };

      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/user')
            .send(alreadyTakenUser)
            .end((err, res) => {
              expect(res.body.error).to.equal('Username already in use');
              expect(res.body.success).to.be.false;
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should return success: true and message: User successfully created if successful', done => {
      const newUser = {
        username: 'Fred',
        password: 'fredfred',
        role: 'user'
      };

      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
              expect(res.body.message).to.equal('User successfully created');
              expect(res.body.success).to.be.true;
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('new user should be present in the DB if successful', done => {
      const newUser = {
        username: 'Fred',
        password: 'fredfred',
        role: 'user'
      };

      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/user')
            .send(newUser)
            .end((err, res) => {
              db.query('SELECT * FROM users WHERE username = ? AND role = ?', [newUser.username, newUser.role], (err, results) => {
                if(err) {
                  throw err;
                }
                expect(results.length).to.equal(1);
                agent.close(err => {
                  done();
                })
              })
            })
        })
    });
  });
  
  /*
    GET /api/user/:id
    ACCESS: logged in ADMIN
  */
  describe('GET /api/user/:id', () => {
    it('should return the correct user object if a user exists with the id provided', done => {
      db.query('SELECT id FROM users WHERE username = ?', [user1.username], (err, results) => {
        if(err) {
          throw err;
        }
        const id = results[0].id;

        const agent = chai.request.agent(server);
        agent
          .post('/auth/login')
          .send(admin1)
          .end((err, res) => {
            expect(res).to.have.cookie('session_id');

            agent
              .get(`/api/user/${id}`)
              .end((err, res) => {
                expect(res.body.user).to.be.an('object');
                expect(res.body.user.username).to.equal(user1.username);
                expect(res.body.success).to.be.true;
                agent.close(err => {
                  done();
                })
              })
          })
      })
    });
    it('should return an error if no user with the provided id exists', done => {
      const agent = chai.request.agent(server);
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .get(`/api/user/0`)
            .end((err, res) => {
              expect(res.body.user).to.be.null;
              expect(res.body.success).to.be.false;
              expect(res.body.error).to.equal('No user exists with this id');
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should return 403 and an error if not logged in as admin before trying to get a user', done => {
      db.query('SELECT id FROM users WHERE username = ?', [user1.username], (err, results) => {
        if(err) {
          throw err;
        }
        const id = results[0].id;

        chai.request(server)
          .get(`/api/user/${id}`)
          .end((err, res) => {
            expect(res).to.have.status(403);
            expect(res.body.error).to.equal('Access denied');
            expect(res.body.success).to.be.false;
            done();
          })
      })
    });
  });
  // /*
  //   PUT /api/user
  // */
  // describe('PUT /api/user/:id', () => {
  //   it('', done => {

  //   });
  // });
  // /*
  //   DELETE /api/user
  // */
  // describe('DELETE /api/user/:id', () => {
  //   it('', done => {

  //   });
  // });

  // /*
  //   GET /api/users
  // */
  // describe('GET /api/users', () => {
  //   it('', done => {

  //   });
  // });
  // /*
  //   DELETE /api/users
  // */
  // describe('GET /api/users', () => {
  //   it('', done => {

  //   });
  // });

});