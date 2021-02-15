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
    db.query(contentTypeQuery.createTable(contentType1), (err, results) => {
      if(err) {
        throw err;
      }
      done();
    });
  });
  // remove post content type after every it block so it can be put back to its original state by the beforeEach hook
  afterEach(done => {
    db.query(contentTypeQuery.dropTable(contentType1.name), (err, results) => {
      if(err) {
        throw err;
      }
      done();
    });
  });
  /*
  POST /api/content-type
  ACCESS: logged in ADMIN
  */
  describe('POST /api/content-type', () => {
    const newContentType = {
      name: 'park',
      fields: [
        {
          name: 'park_name',
          type: 'text',
          required: true
        },
        {
          name: 'suburb',
          type: 'text',
          required: true
        },
        {
          name: 'no_of_barbeques',
          type: 'int',
          required: true
        }
      ]
    };

    it('should return 403 and an error if not logged in as admin before trying to create a new content type', done => {
      chai.request(server)
        .post('/api/content-type')
        .send(newContentType)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body.error).to.equal('Access denied');
          expect(res.body.success).to.be.false;
          done();
        })
    });
    it('should return an error and success: false if the username is already in use', done => {
      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/content-type')
            .send(contentType1)
            .end((err, res) => {
              expect(res.body.error).to.equal('A content type already exists with that name');
              expect(res.body.success).to.be.false;
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should return an error and success: false if the new user object does not pass validation', done => {
      const invalidContentType = {
        name: 'double"quotes"in-name',
        extraProp: true,
        fields: [
          {
            name: 'park-name',
            type: 'text',
            required: true
          },
          {
            name: '5678suburb',
            type: 'text',
            required: true
          },
        ]
      };

      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/content-type')
            .send(invalidContentType)
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
    it('should return an error and success: false if SQL injection is attempted', done => {
      const injectionContentType = {
        name: 'restaurants (id INT NOT NULL AUTO_INCREMENT, name TEXT, PRIMARY KEY (id)); DROP TABLE users;',
        fields: [
          {
            name: 'park_name',
            type: 'text',
            required: true
          },
          {
            name: 'suburb',
            type: 'text',
            required: true
          },
        ]
      };

      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/content-type')
            .send(injectionContentType)
            .end((err, res) => {
              expect(res).to.have.status(400);
              expect(res.body.error).to.equal('Content type name and fields properties must only contain letters and underscores');
              expect(res.body.success).to.be.false;
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should return success: true and message: Content type successfully created if successful', done => {
      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/content-type')
            .send(newContentType)
            .end((err, res) => {
              expect(res.body.message).to.equal('Content type successfully created');
              expect(res.body.success).to.be.true;
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('new content type table should be present in the DB if successful', done => {
      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/content-type')
            .send(newContentType)
            .end((err, res) => {
              
              db.query('SELECT * FROM parks', (err, results) => {
                if(err) {
                  if(err.code !== 'ER_NO_SUCH_TABLE') {
                    console.log('Error is something other than table does not exist!');
                  }
                  throw err;
                }
                expect(err).to.be.null;
                agent.close(err => {
                  done();
                })
              });
            })
        })
    });
  });

});