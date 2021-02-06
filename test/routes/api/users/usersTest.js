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
    // remove non admin user before the next test in order to avoid unwanted side effects
    db.query('DELETE FROM users WHERE username = ?', [user1.username], (err, results) => {
      if(err) {
        throw err;
      }
      done();
    });
  });
  /*
    POST /api/user
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
  });
  // /*
  //   GET /api/user
  // */
  // describe('GET /api/user/:id', () => {
  //   it('', done => {

  //   });
  // });
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