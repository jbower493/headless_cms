// import dependencies
const expect = require('chai').expect;

// import validators
const validateUser = require('../../validators/validateUser');

describe('VALIDATORS', () => {
  /*
    Validate User method
  */
  describe('validateUser', () => {
    it('should return true if user object passes validation', () => {
      expect(validateUser({ username: 'DarthVader', password: 'password1', role: 'user' })).to.be.true;
    });
    it('should return "field(s) missing if not all fields are present', () => {
      expect(validateUser({ username: 'DarthVader', role: 'user' })).to.equal('Field(s) missing');
    });
    it('should return "username not string" if username field is not a string', () => {
      expect(validateUser({ username: 10, password: 'password1', role: 'user' })).to.equal('Username not string');
    });
    it('should return "password not string" if password field is not a string', () => {
      expect(validateUser({ username: 'DarthVader', password: { darth: 'vader' }, role: 'user' })).to.equal('Password not string');
    });
    it('should return "username too long" if username field is more than 30 chars', () => {
      expect(validateUser({ username: 'Somestupidusernamethatswaytoolongtopassthetestobviously', password: 'password1', role: 'user' })).to.equal('Username too long');
    });
    it('should return "password too short" if password field is less than 5 chars', () => {
      expect(validateUser({ username: 'BilboBaggins', password: 'ok', role: 'user' })).to.equal('Password too short');
    });
    it('should return "role must be "user" or "admin"" if role field is not user or admin', () => {
      expect(validateUser({ username: 'DarthVader', password: 'password1', role: 'someotherrole' })).to.equal('Role must be "user" or "admin"');
    });
  });
});