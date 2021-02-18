// import dependencies
const expect = require('chai').expect;

// import validators
const validateUser = require('../../validators/validateUser');
const validateContentType = require('../../validators/validateContentType');
const validateContent = require('../../validators/validateContent');

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
    it('should return "Properties missing" if not all fields are present', () => {
      const invalidContentType = {
        name: 'post',
      };
      expect(validateContentType(invalidContentType)).to.equal('Properties missing');
    });
    it('should return "Too many properties" if the content type object has too many properties', () => {
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
      expect(validateContentType(invalidContentType)).to.equal('Too many properties');
    });
    it('should return "Invalid content type name" if content type name contains bad input', () => {
      const fields = [
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
      ];
      const badName1 = 'something-bad';
      const badName2 = 'something123';
      const badName3 = 'something%';
      const badName4 = 'somethingBAD';

      expect(validateContentType({ name: badName1, fields })).to.equal('Invalid content type name');
      expect(validateContentType({ name: badName2, fields })).to.equal('Invalid content type name');
      expect(validateContentType({ name: badName3, fields })).to.equal('Invalid content type name');
      expect(validateContentType({ name: badName4, fields })).to.equal('Invalid content type name');
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
      const name = 'post';

      const badFields1 = [
        {
          name: 'something-bad',
          type: 'text',
          required: true
        }
      ];
      const badFields2 = [
        {
          name: 'something123',
          type: 'text',
          required: true
        }
      ];
      const badFields3 = [
        {
          name: 'something%',
          type: 'text',
          required: true
        }
      ];
      const badFields4 = [
        {
          name: 'somethingBAD',
          type: 'text',
          required: true
        }
      ];
      expect(validateContentType({ name, fields: badFields1 })).to.equal('Invalid field name(s)');
      expect(validateContentType({ name, fields: badFields2 })).to.equal('Invalid field name(s)');
      expect(validateContentType({ name, fields: badFields3 })).to.equal('Invalid field name(s)');
      expect(validateContentType({ name, fields: badFields4 })).to.equal('Invalid field name(s)');
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
  /*
  Validate Content
  */
  describe('validate content', () => {
    const postContentType = {
      name: 'post',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'text', required: true },
        { name: 'image_ref', type: 'text', required: false },
        { name: 'owner_id', type: 'int', required: true }
      ]
    };
  
    const post1 = {
      title: 'A New Start',
      body: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet.',
      image_ref: '/images/a-new-start.jpg'
    };

    const girafeContentType = {
      name: 'girafe',
      fields: [
        { name: 'first_name', type: 'text', required: true },
        { name: 'neck_height', type: 'int', required: true },
        { name: 'family', type: 'json', required: false },
        { name: 'weight', type: 'int', required: true },
        { name: 'owner_id', type: 'int', required: true }
      ]
    };

    const girafe1 = {
      first_name: 'Kenny',
      neck_height: 277,
      family: '{"name": "Gary", "relationship": "brother"}',
      weight: 211
    };

    it('should return true if content passes validation', () => {
      expect(validateContent(post1, postContentType)).to.be.true;
      expect(validateContent(girafe1, girafeContentType)).to.be.true;
    });
    it('should still return true if a non required field is null and every other field is fine', () => {
      const girafeFamilyNull = {
        first_name: 'Kenny',
        neck_height: 277,
        family: null,
        weight: 211
      };
      expect(validateContent(girafeFamilyNull, girafeContentType)).to.be.true;
    });
    it('should return an error if the number of properties on content object doesnt match the content type', () => {
      const invalidGirafe = {
        first_name: 'Kenny',
        neck_height: 277,
        family: '{"name": "Gary", "relationship": "brother"}',
        weight: 211,
        squad: 'squaded up'
      };
      expect(validateContent(invalidGirafe, girafeContentType)).to.equal('Wrong number of properties on content object');
    });
    it('should return an error if any field names from the content object do not exists on the content type', () => {
      const invalidGirafe = {
        first_name: 'Kenny',
        neck_height: 277,
        family: '{"name": "Gary", "relationship": "brother"}',
        leaves_per_day: 211
      };
      expect(validateContent(invalidGirafe, girafeContentType)).to.equal('Content fields do not match content type fields');
    });
    it('should return an error if any content field values do not conform to their constraints', () => {
      const invalidGirafe = {
        first_name: 'Kenny',
        neck_height: 277,
        family: {"name": "Gary", "relationship": "brother"},
        weight: 211
      };
      expect(validateContent(invalidGirafe, girafeContentType)).to.equal('One or more content fields does not fit the constraints of its field type');
    });
  });

});