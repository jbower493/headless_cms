// import dependencies
const chai = require('chai');
const chaiHttp = require('chai-http')
const mysql = require('mysql');

// import config objects
const server = require('../server');

// create db connection to test db, can't import this fromserver or it throws some handshake error
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'headless_cms_test'
});

// assertion style
chai.should();
chai.use(chaiHttp);

// parent block
describe('main', () => {
  // runs once after all tests in the main describe block
  before((done) => {
    db.connect(err => {
      if(err) console.log(err.stack);
    })
    done();
  });
  // runs once after all tests in the main describe block
  after(() => {
    db.end();
  });

  /*
    Test the GET / route
  */
  describe('GET /', () => {
    it('should return a response with a message property that includes a welcome message', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.body.should.have.property('message');
          done();          
        })
    });
  });
});