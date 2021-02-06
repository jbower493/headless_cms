// import dependencies
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http')
const mysql = require('mysql');
const bcrypt = require('bcrypt');

// salt rounds for any bcrypt hashes
const saltRounds = 10;

// create db connection to test db, can't import this fromserver or it throws some handshake error
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'headless_cms_test'
});

// import server
const server = require('../../../server');

// use chai http
chai.use(chaiHttp);

// parent block
describe('AUTH', () => {
  const user1 = {
    username: 'Bilbo',
    password: 'baggins',
    role: 'user'
  };
  const user1Hash = bcrypt.hashSync(user1.password, saltRounds);
  // runs once after all tests in the main describe block
  before((done) => {
    db.connect(err => {
      if(err) {
        throw err;
      }
      db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [user1.username, user1Hash, user1.role], (err, results) => {
        if(err) {
          throw err;
        }
        done();
      });
    });
  });
  // runs once after all tests in the main describe block
  after((done) => {
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
  /*
    GET /auth/get-user
  */
  describe('GET /auth/get-user', () => {
    it('should send back a message and the logged in user if a user is logged in', (done) => {
      const agent = chai.request.agent(server);
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .get('/auth/get-user')
            .end((err, res) => {
              expect(res.body.user).to.be.an('object');
              expect(res.body.message).to.equal('A user is logged in');
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should send back a message and user: null if no user is logged in', (done) => {
      chai.request(server)
        .get('/auth/get-user')
        .end((err, res) => {
          expect(res.body.message).to.equal('No user is logged in');
          expect(res.body.user).to.be.null;
          done(); 
        })
    });
  });
  /*
    POST /auth/login
  */
  describe('POST /auth/login', () => {
    it('should return an object with success: true and user property if correct credentials are provided', (done) => {
      chai.request(server)
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res.body.success).to.be.true;
          expect(res.body.user).to.be.an('object');
          done(); 
        })
    });
    it('should return an error on the response if incorrect credentials are provided', (done) => {
      const falseUser = {
        username: 'NotARealUser',
        password: 'password2',
        role: 'user'
      };

      chai.request(server)
        .post('/auth/login')
        .send(falseUser)
        .end((err, res) => {
          expect(res.body.success).to.be.false;
          expect(res.body.error).to.equal('Incorrect credentials');
          done();
        })
    });
    it('should return an error on the response if not all fields are provided', (done) => {
      const incompleteUser = {
        username: 'NotARealUser',
        role: 'user'
      };

      chai.request(server)
        .post('/auth/login')
        .send(incompleteUser)
        .end((err, res) => {
          expect(res.body.success).to.be.false;
          expect(res.body.error).to.equal('Field(s) missing');
          done();
        })
    });
    it('should return an error on the response if fields are not all strings', (done) => {
      const notStringsUser = {
        username: { key: 'value' },
        password: ['an', 'array'],
        role: 10
      };

      chai.request(server)
        .post('/auth/login')
        .send(notStringsUser)
        .end((err, res) => {
          expect(res.body.success).to.be.false;
          expect(res.body.error).to.equal('Not strings');
          done();
        })
    });
    it('should return an error on the response if role is not user or admin', (done) => {
      const incorrectRoleUser = {
        username: 'NotARealUser',
        password: 'password2',
        role: 'master user'
      };

      chai.request(server)
        .post('/auth/login')
        .send(incorrectRoleUser)
        .end((err, res) => {
          expect(res.body.success).to.be.false;
          expect(res.body.error).to.equal('Incorrect role');
          done();
        })
    });
  })
  /*
    GET /auth/logout
  */
  describe('GET /auth/logout', () => {
    it('should return success: true and a success message, and log the current user out so that req.user is undefined on a subsequent get-user request', (done) => {
      const agent = chai.request.agent(server);
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .get('/auth/logout')
            .end((err, res) => {
              expect(res.body.success).to.be.true;
              expect(res.body.message).to.equal('Successfully logged out');

              agent
                .get('/auth/get-user')
                .end((err, res) => {
                  expect(res.body.message).to.equal('No user is logged in');
                  expect(res.body.user).to.be.null;
                  agent.close(err => {
                    done();
                  })
                })
            })
        })
    });
    it('should return an error if there is no user currently logged in', (done) => {
      chai.request(server)
        .get('/auth/logout')
        .end((err, res) => {
          expect(res.body.error).to.equal('No user is logged in');
          expect(res.body.success).to.be.false;
          done();
        })
    });
  });

});