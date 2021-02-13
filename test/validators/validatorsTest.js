// import dependencies
const expect = require('chai').expect;

// import validators
const validateUser = require('../../validators/validateUser');

describe('VALIDATORS', () => {
  /*
    Validate User method
  */

  const defaultPrivileges = {
    "create": "yes",
    "read own": "yes",
    "read any": "yes",
    "update own": "yes",
    "update any": "no",
    "delete own": "yes",
    "delete any": "no"
  };

  describe('validateUser', () => {
    it('should return true if user object passes validation', () => {
      expect(validateUser({ username: 'DarthVader', password: 'password1', role: 'user', privileges: defaultPrivileges })).to.be.true;
    });
    it('should return "field(s) missing if not all fields are present', () => {
      expect(validateUser({ username: 'DarthVader', role: 'user' })).to.equal('Field(s) missing');
    });
    it('should return "username not string" if username field is not a string', () => {
      expect(validateUser({ username: 10, password: 'password1', role: 'user', privileges: defaultPrivileges })).to.equal('Username not string');
    });
    it('should return "password not string" if password field is not a string', () => {
      expect(validateUser({ username: 'DarthVader', password: { darth: 'vader' }, role: 'user', privileges: defaultPrivileges })).to.equal('Password not string');
    });
    it('should return "username too long" if username field is more than 30 chars', () => {
      expect(validateUser({ username: 'Somestupidusernamethatswaytoolongtopassthetestobviously', password: 'password1', role: 'user', privileges: defaultPrivileges })).to.equal('Username too long');
    });
    it('should return "password too short" if password field is less than 5 chars', () => {
      expect(validateUser({ username: 'BilboBaggins', password: 'ok', role: 'user', privileges: defaultPrivileges })).to.equal('Password too short');
    });
    it('should return "role must be "user" or "admin"" if role field is not user or admin', () => {
      expect(validateUser({ username: 'DarthVader', password: 'password1', role: 'someotherrole', privileges: defaultPrivileges })).to.equal('Role must be "user" or "admin"');
    });
    it('should return "Privileges must be an object" if privileges is not an object', () => {
      expect(validateUser({ username: 'DarthVader', password: 'password1', role: 'user', privileges: 'not an array' })).to.equal('Privileges must be an object');
    });
    it('should return "Privileges object must have all the correct keys and no more" if one or more privilege is incorrect', () => {
      const invalidPrivileges = {
        "create": "yes",
        "superuser": "yes",
        "read any": "yes",
        "update own": "yes",
        "is spiderman": "no",
        "delete own": "yes",
        "is stormtrooper": "yes"
      };

      expect(validateUser({ username: 'DarthVader', password: 'password1', role: 'user', privileges: invalidPrivileges })).to.equal('Privileges object must have all the correct keys and no more');
    });
  });
});