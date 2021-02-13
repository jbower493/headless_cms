module.exports = {
  sql(ctObj) {
    const fields = ctObj.fields;
    const fieldsConstraints = fields.map(field => {
      let required = '';
      if(field.required) {
        required = 'NOT NULL';
      }
      return `? ? ${required}, `;
    });
    const fieldsSQL = fieldsConstraints.join('');

    const finalSQL = `CREATE TABLE ? (id INT NOT NULL AUTO_INCREMENT, ${fieldsSQL}PRIMARY KEY (id))`;
console.log(finalSQL)
    return finalSQL;
  },

  params(ctObj) {
    const fields = ctObj.fields;
    const fieldsNext = fields.map(field => {
      return {
        name: field.name,
        type: field.type.toUpperCase()
      }
    });
    const params = [`${ctObj.name}s`];
    fieldsNext.forEach(field => {
      params.push(field.name);
      params.push(field.type);
    });
console.log(params)
    return params;
  }
};