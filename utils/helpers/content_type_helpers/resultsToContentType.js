module.exports = (results, contentTypeName) => {
  // remove id field from response
  results.forEach(field => {
    if(field.Field === 'id') {
      results.splice(results.indexOf(field), 1);
    }
  });

  // map results to a valid content type object
  const responseFields = results.map(field => {
    const name = field.Field;
    let type;
    let required = false;

    if(field.Type.includes('int')) {
      type = 'int';
    } else {
      type = field.Type;
    }
    if(field.Null === 'NO') {
      required = true;
    }

    return {
      name,
      type,
      required
    };
  });

  return {
    name: contentTypeName,
    fields: responseFields
  };
};