// import dependencies
const expect = require('chai').expect;

// import validators
const validateUser = require('../../validators/validateUser');
const validateContentType = require('../../validators/validateContentType');

describe('VALIDATORS', () => {
  /*
    Validate User method
  */
  describe('validateUser', () => {
    const defaultPrivileges = {
      "create": "yes",
      "read own": "yes",
      "read any": "yes",
      "update own": "yes",
      "update any": "no",
      "delete own": "yes",
      "delete any": "no"
    };

    it('should return true if user object passes validation', () => {
      expect(validateUser({ username: 'DarthVader', password: 'password1', role: 'user', privileges: defaultPrivileges })).to.be.true;
    });
    it('should return "field(s) missing if not all fields are present', () => {
      expect(validateUser({ username: 'DarthVader', role: 'user' })).to.equal('Field(s) missing');
    });
    it('should return "too many fields" if extra fields are present', () => {
      expect(validateUser({ username: 'Kenny', password: 'kennypass', role: 'user', privileges: defaultPrivileges, extraField: true })).to.equal('Too many fields');
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
  /*
  Validate Content Type
  */
  describe('validate content type', () => {
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

    it('should return true if new content type passes validation', () => {
      expect(validateContentType(contentType1)).to.be.true;
    });
    it('should return "Field(s) missing" if not all fields are present', () => {
      const invalidContentType = {
        name: 'post',
      };
      expect(validateContentType(invalidContentType)).to.equal('');
    });
    it('should return "Too many fields" if too many fields are present', () => {
      const invalidContentType = {
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
        ],
        extraField: true
      };
      expect(validateContentType(invalidContentType)).to.equal('Too many fields');
    });
    it('should return "Invalid content type name" if content type name contains bad input', () => {
      const invalidContentType = {
        name: 'post-123&something',
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
      expect(validateContentType(invalidContentType)).to.equal('Invalid content type name');
    });
    it('should return "Content type name too long" if content type name is too long', () => {
      const invalidContentType = {
        name: 'a_really_really_really_long_content_type_name',
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
      expect(validateContentType(invalidContentType)).to.equal('Content type name too long');
    });
    it('should return "Invalid field name(s)" if field names contain bad input', () => {
      const invalidContentType = {
        name: 'post',
        fields: [
          {
            name: 'title#@hello5',
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
      expect(validateContentType(invalidContentType)).to.equal('Invalid field name(s)');
    });
    it('should return "Field name(s) too long" if field names are too long', () => {
      const invalidContentType = {
        name: 'post',
        fields: [
          {
            name: 'a_really_really_long_field_name_to_fail_the_test',
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
      expect(validateContentType(invalidContentType)).to.equal('Field name(s) too long');
    });
    it('should return "Invalid field type(s)" if field types are not on allowed type list', () => {
      const invalidContentType = {
        name: 'post',
        fields: [
          {
            name: 'title',
            type: 'anothertype',
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
      expect(validateContentType(invalidContentType)).to.equal('Invalid field type(s)');
    });
    it('should return "Required is not a boolean" if required is not a boolean', () => {
      const invalidContentType = {
        name: 'post',
        fields: [
          {
            name: 'title',
            type: 'text',
            required: 'no'
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
      expect(validateContentType(invalidContentType)).to.equal('Required is not a boolean');
    });
  });

});