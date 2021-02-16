module.exports = (contentType) => {
  const { name, fields } = contentType;
  if(!name || !fields) {
    return 'Properties missing';
  }

  if(Object.keys(contentType).length > 2) {
    return 'Too many properties';
  }

  // this returns true if all chars are either a lowercase letter or an underscore
  const regex = /^[a-z_]*$/;

  if(!regex.test(name)) {
    return 'Invalid content type name';
  }

  if(name.length > 20) {
    return 'Content type name too long';
  }

  let badFieldName = false;
  let longFieldName = false;
  let badFieldType = false;
  let requiredNotBool = false;

  fields.forEach(field => {
    if(!regex.test(field.name)) {
      badFieldName = true;
    }
    if(field.name.length > 20) {
      longFieldName = true;
    }
    if(field.type !== 'text' && field.type !== 'int' && field.type !== 'json') {
      badFieldType = true;
    }
    if(typeof field.required !== 'boolean') {
      requiredNotBool = true;
    }
  });

  if(badFieldName) {
    return 'Invalid field name(s)';
  }
  if(longFieldName) {
    return 'Field name(s) too long';
  }
  if(badFieldType) {
    return 'Invalid field type(s)';
  }
  if(requiredNotBool) {
    return 'Required is not a boolean';
  }

  // if no errors have been picked up, return true
  return true;
};