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

describe('API/CONTENT-TYPES', () => {
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
      },
      {
        name: 'skate_parks',
        type: 'json',
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
      db.query('INSERT INTO users (username, password, role, privileges) VALUES (?, ?, ?, ?), (?, ?, ?, ?)', [admin1.username, admin1Hash, admin1.role, JSON.stringify(adminPrivileges), user1.username, user1Hash, user1.role, JSON.stringify(user1Privileges)], (err, results) => {
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
    db.query(contentTypeQuery.dropTable([contentType1.name, newContentType.name]), (err, results) => {
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
    it('should return 403 and an error if not logged in before trying to create a new content type', done => {
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
    it('should return 403 and an error if logged in as a regular user before trying to create a new content type', done => {
      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .post('/api/content-type')
            .send(newContentType)
            .end((err, res) => {
              expect(res).to.have.status(403);
              expect(res.body.error).to.equal('Access denied');
              expect(res.body.success).to.be.false;
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should return an error and success: false if a content type already exists with that name', done => {
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
    it('should return an error and success: false if the new content type object does not pass validation', done => {
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
              expect(res.body.error).to.be.a('string');
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
                    throw err;
                  }
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
  /*
  GET /api/content-type/:name
  ACCESS: logged in USER
  */
  describe('GET /api/content-type/:name', () => {
    it('should return 403 and an error if not logged in as a user before trying to view a content type', done => {
      chai.request(server)
        .get(`/api/content-type/${contentType1.name}`)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body.error).to.equal('Access denied');
          expect(res.body.success).to.be.false;
          done();
        })
    });
    it('should return error if provided content type name in not valid', done => {
      const agent = chai.request.agent(server);
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .get('/api/content-type/Hello1066!')
            .end((err, res) => {
              expect(res.body.contentType).to.be.null;
              expect(res.body.success).to.be.false;
              expect(res.body.error).to.equal('Name parameter must contain only lowercase letters or underscores');
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should return error if no content type exists with the name provided', done => {
      const agent = chai.request.agent(server);
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .get('/api/content-type/flamingo')
            .end((err, res) => {
              expect(res.body.contentType).to.be.null;
              expect(res.body.success).to.be.false;
              expect(res.body.error).to.equal('No content type with that name exists');
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should return the correct content type object if one exists with the name provided', done => {
      const agent = chai.request.agent(server);
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .get(`/api/content-type/${contentType1.name}`)
            .end((err, res) => {
              expect(res.body.contentType).to.be.an('object');
              expect(res.body.contentType.name).to.equal(contentType1.name);
              expect(res.body.contentType.fields[0].name).to.equal(contentType1.fields[0].name);
              expect(res.body.success).to.be.true;
              expect(res.body.message).to.equal('Content Type successfully fetched');
              agent.close(err => {
                done();
              })
            })
        })
    });
  });
  // /*
  // PUT /api/content-type/:name
  // ACCESS: logged in ADMIN
  // */
  // describe('PUT /api/content-type/:name', () => {
  //   const updatedContentType = {
  //     name: 'post',
  //     fields: [
  //       {
  //         name: 'heading',
  //         type: 'text',
  //         required: true
  //       },
  //       {
  //         name: 'paragraph_one',
  //         type: 'text',
  //         required: true
  //       },
  //       {
  //         name: 'paragraph_two',
  //         type: 'text',
  //         required: false
  //       },
  //       {
  //         name: 'no_of_comments',
  //         type: 'int',
  //         required: true
  //       }
  //     ]
  //   };

  //   it('should return 403 and an error if not logged in as a user before trying to update a content type', done => {
  //     chai.request(server)
  //       .put(`/api/content-type/${contentType1.name}`)
  //       .send(updatedContentType)
  //       .end((err, res) => {
  //         expect(res).to.have.status(403);
  //         expect(res.body.error).to.equal('Access denied');
  //         expect(res.body.success).to.be.false;
  //         done();
  //       })
  //   });
  //   it('should return an error if no content type with the provided name exists', done => {
  //     const agent = chai.request.agent(server);
  //     agent
  //       .post('/auth/login')
  //       .send(admin1)
  //       .end((err, res) => {
  //         expect(res).to.have.cookie('session_id');

  //         agent
  //           .put('/api/content-type/flamingo')
  //           .send(updatedContentType)
  //           .end((err, res) => {
  //             expect(res.body.success).to.be.false;
  //             expect(res.body.error).to.equal('No content type with that name exists');
  //             agent.close(err => {
  //               done();
  //             })
  //           })
  //       })
  //   });
  //   it('should return an error and success: false if the altered content type object does not pass validation', done => {
  //     const invalidContentType = {
  //       name: 'post',
  //       fields: [
  //         {
  //           name: 'heading-1',
  //           type: 'text',
  //           required: true
  //         },
  //         {
  //           name: 'paragraph_one',
  //           type: 'paragraph',
  //           required: true
  //         },
  //         {
  //           name: 'no_of_comments',
  //           type: 'int',
  //           required: 'yes'
  //         }
  //       ]
  //     };

  //     const agent = chai.request.agent(server)
  //     agent
  //       .post('/auth/login')
  //       .send(admin1)
  //       .end((err, res) => {
  //         expect(res).to.have.cookie('session_id');

  //         agent
  //           .put(`/api/content-type/${contentType1.name}`)
  //           .send(invalidContentType)
  //           .end((err, res) => {
  //             expect(res).to.have.status(400);
  //             expect(res.body.error).to.be.a('string');
  //             expect(res.body.success).to.be.false;
  //             agent.close(err => {
  //               done();
  //             })
  //           })
  //       })
  //   });
  //   it('should return success: true and message: Content type successfully updated if successful', done => {
  //     const agent = chai.request.agent(server)
  //     agent
  //       .post('/auth/login')
  //       .send(admin1)
  //       .end((err, res) => {
  //         expect(res).to.have.cookie('session_id');

  //         agent
  //           .put(`/api/content-type/${contentType1.name}`)
  //           .send(updatedContentType)
  //           .end((err, res) => {
  //             expect(res.body.message).to.equal('Content type successfully updated');
  //             expect(res.body.success).to.be.true;
  //             agent.close(err => {
  //               done();
  //             })
  //           })
  //       })
  //   });
  //   it('content type with updated name in the DB should have fields matching the altered content type if successful', done => {
  //     const agent = chai.request.agent(server)
  //     agent
  //       .post('/auth/login')
  //       .send(admin1)
  //       .end((err, res) => {
  //         expect(res).to.have.cookie('session_id');

  //         agent
  //           .put(`/api/content-type/${contentType1.name}`)
  //           .send(updatedContentType)
  //           .end((err, res) => {
  //             db.query(`SHOW COLUMNS FROM headless_cms_test.${contentType1.name}s`, (err, results) => {
  //               expect(err).to.be.null;

  //               // map results to a valid content type object
  //               const responseFields = results.map(field => {
  //                 const name = field.Field;
  //                 let type;
  //                 let required = false;

  //                 if(field.Type.includes('int')) {
  //                   type = 'int';
  //                 } else {
  //                   type = field.Type;
  //                 }
  //                 if(field.Null === 'NO') {
  //                   required = true;
  //                 }

  //                 return {
  //                   name,
  //                   type,
  //                   required
  //                 };
  //               });
  //               expect(responseFields[0].name).to.equal(updatedContentType.fields[0].name);
  //               expect(responseFields[0].type).to.equal(updatedContentType.fields[0].type);
  //               expect(responseFields[0].required).to.equal(updatedContentType.fields[0].required);
  //               expect(responseFields[1].name).to.equal(updatedContentType.fields[1].name);
  //               expect(responseFields[1].type).to.equal(updatedContentType.fields[1].type);
  //               expect(responseFields[1].required).to.equal(updatedContentType.fields[1].required);
  //               expect(responseFields[2].name).to.equal(updatedContentType.fields[2].name);
  //               expect(responseFields[2].type).to.equal(updatedContentType.fields[2].type);
  //               expect(responseFields[2].required).to.equal(updatedContentType.fields[2].required);
  //               agent.close(err => {
  //                 done();
  //               })
  //             });
  //           })
  //       })
  //   });
  // });
  /*
  DELETE /api/content-type/:name
  ACCESS: logged in ADMIN
  */
  describe('DELETE /api/content-type/:name', () => {
    it('should return 403 and an error if not logged in as admin before trying to delete a content type', done => {
      chai.request(server)
        .delete(`/api/content-type/${contentType1.name}`)
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body.error).to.equal('Access denied');
          expect(res.body.success).to.be.false;
          done();
        })
    });
    it('should return an error if no content type with the provided name exists', done => {
      const agent = chai.request.agent(server);
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .delete(`/api/content-type/flamingo`)
            .end((err, res) => {
              expect(res.body.success).to.be.false;
              expect(res.body.error).to.equal('No content type with that name exists');
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('should return success: true and message: Content type successfully deleted if successful', done => {
      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .delete(`/api/content-type/${contentType1.name}`)
            .end((err, res) => {
              expect(res.body.message).to.equal('Content type successfully deleted');
              expect(res.body.success).to.be.true;
              agent.close(err => {
                done();
              })
            })
        })
    });
    it('content type with deleted name should no longer be present in the DB if successful', done => {
      const agent = chai.request.agent(server)
      agent
        .post('/auth/login')
        .send(admin1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .delete(`/api/content-type/${contentType1.name}`)
            .end((err, res) => {
              db.query(`SELECT * FROM ${contentType1.name}s`, (err, results) => {
                expect(err.code).to.equal('ER_NO_SUCH_TABLE');
                agent.close(err => {
                  done();
                })
              })
            })
        })
    });
  });
  /*
  GET /api/content-types
  ACCESS: logged in USER
  */
  describe('GET /api/content-types', () => {
    // runs before each it block in THIS describe block only, don't need to do an after each beacuse this content type gets removed if exists in the first after each block at the top of the test script
    beforeEach(done => {
      db.query(contentTypeQuery.createTable(newContentType), (err, results) => {
        if(err) {
          throw err;
        }
        done();
      });
    });

    it('should return 403 and an error if not logged in as a user before trying to get all content types', done => {
      chai.request(server)
        .get('/api/content-types')
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body.error).to.equal('Access denied');
          expect(res.body.success).to.be.false;
          done();
        })
    });
    it('should return an array of all content types if successful', done => {
      const agent = chai.request.agent(server);
      agent
        .post('/auth/login')
        .send(user1)
        .end((err, res) => {
          expect(res).to.have.cookie('session_id');

          agent
            .get('/api/content-types')
            .end((err, res) => {
              expect(res.body.success).to.be.true;
              expect(res.body.contentTypes).to.be.an('array');
              expect(res.body.contentTypes.length).to.equal(2);
              // the order of these is reversed because parks comes before posts alphabetically, so is shown first in the results, even though parks was created 2nd
              expect(res.body.contentTypes[0].name).to.equal(newContentType.name);
              expect(res.body.contentTypes[1].name).to.equal(contentType1.name);
              agent.close(err => {
                done();
              })
            })
        });
    });
  });

});