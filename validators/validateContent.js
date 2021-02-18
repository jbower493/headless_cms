module.exports = (content, contentType) => {
  // !IMPORTANT: Make sure when a non required value is left blank by the user on the front end, still send it to the db as null, so that the object can pass validation

  // content validation must be dynamic and go through the following steps:
  // 1. Fetch the correct content type by querying the schema of that table
  // 2. Create a loop which validates each field of that content type
  // Text fields must be of type string and must have less than 30,000 chars
  // int fields must be of type number
  // json fields must be valid json

  contentType.fields.forEach(field => {
    if(field.name === 'owner_id') {
      contentType.fields.splice(contentType.fields.indexOf(field), 1);
    }
  });

  // check if correct number of properties on content object
  if(Object.keys(content).length !== contentType.fields.length) {
    return 'Wrong number of properties on content object';
  }

  // check if all field names match on both objects, and if any field values are non conforming
  let badFieldName = false;
  let nonConformingFieldValue = false;

  contentType.fields.forEach(field => {
    if(!content[field.name]) {
      badFieldName = true;
    }

    if(field.required === false && content[field.name] === null) {
      // do nothing and let it pass through the validation
    } else if(field.type === 'text') {
      if(typeof content[field.name] !== 'string' || content[field.name].length > 30000) {
        nonConformingFieldValue = true;
      }
    } else if(field.type === 'int') {
      if(typeof content[field.name] !== 'number') {
        nonConformingFieldValue = true;
      }
    } else if(field.type === 'json') {
      if(typeof JSON.parse(content[field.name]) !== 'object') {
        nonConformingFieldValue = true;
      }
    }
  });

  if(badFieldName) {
    return 'Content fields do not match content type fields';
  }
  if(nonConformingFieldValue) {
    return 'One or more content fields does not fit the constraints of its field type';
  }

  return true;
};