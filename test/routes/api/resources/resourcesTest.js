// // import dependencies
// const chai = require('chai');
// const expect = chai.expect;
// const chaiHttp = require('chai-http');
// const mysql = require('mysql');
// const bcrypt = require('bcrypt');

// // salt rounds for any bcrypt hashes
// const saltRounds = 10;

// // create db connection to test db, can't import this from server or it throws some handshake error
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'headless_cms_test'
// });

// // import server
// const server = require('../../../../server');

// // use chai http
// chai.use(chaiHttp);

// describe('API/RESOURCES', () => {
//   before(done => {

//   });
//   after(done => {

//   });
//   beforeEach(done => {

//   });
//   afterEach(done => {

//   });
//   /*
//     POST /api/resource
//   */
//   describe('POST /api/resource', () => {
//     it('', done => {

//     });
//   });
//   /*
//     GET /api/resource
//   */
//   describe('GET /api/resource/:id', () => {
//     it('', done => {

//     });
//   });
//   /*
//     PUT /api/resource
//   */
//   describe('PUT /api/resource/:id', () => {
//     it('', done => {

//     });
//   });
//   /*
//     DELETE /api/resource
//   */
//   describe('DELETE /api/resource/:id', () => {
//     it('', done => {

//     });
//   });

//   /*
//     GET /api/resources
//   */
//   describe('GET /api/resources', () => {
//     it('', done => {

//     });
//   });
//   /*
//     DELETE /api/resources
//   */
//   describe('GET /api/resources', () => {
//     it('', done => {

//     });
//   });

// });