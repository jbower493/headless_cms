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
  const agent = chai.request.agent();

  const user1 = {
    username: 'JohnDoe1',
    password: 'password1',
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
    GET /auth/login
  *//*
  describe('GET /auth/login', () => {
    it('should return an object with success: true property if correct credentials are provided', (done) => {
      chai.request(server)
        .get('/auth/login')
        .end((err, res) => {
          expect(res.body).to.have.property('success');
          expect(res.body.success).to.be.true;
          done(); 
        })
    });
    it('should return an object with success: false property if incorrect credentials are provided', (done) => {
      chai.request(server)
        .get('/auth/login')
        .end((err, res) => {
          expect(res.body).to.have.property('success');
          expect(res.body.success).to.be.false;
          done(); 
        })
    });
  })*/
  /*
    GET /auth/get-user
  */
  describe('GET /auth/get-user', () => {
    it('should send back a message and the logged in user if a user is logged in', (done) => {
      agent
        .post('/auth/login')
        .send({ username: user1.username, password: user1.password })
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');
          console.log(res.cookie('session_id'));

          // send next request which should come back with the cookie still there
          agent
            .get('/auth/get-user')
            .end((err, res) => {
              expect(res.body).to.have.property('message');
              expect(res.body).to.have.property('user');
              expect(res.body.message).to.equal('A user is logged in');
              expect(res.body.user).to.be.an('object');
              console.log(res.cookie('session_id'));
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
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('user');
          expect(res.body.message).to.equal('No user is logged in');
          expect(res.body.user).to.be.null;
          done(); 
        })
    });
  });
  

});