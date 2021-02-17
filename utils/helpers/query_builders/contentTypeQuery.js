module.exports = {
  createTable(contentType) {
    const { fields } = contentType;
    const columns = fields.map(field => {
      let required = '';
      if(field.required) {
        required = 'NOT NULL';
      }
      return `${field.name} ${field.type.toUpperCase()} ${required}, `;
    }).join('');

    return `CREATE TABLE IF NOT EXISTS ${contentType.name}s (id INT NOT NULL AUTO_INCREMENT, ${columns}owner_id INT NOT NULL, PRIMARY KEY (id), FOREIGN KEY (owner_id) REFERENCES users(id))`;
  },

  dropTable(contentTypeName) {
    if(typeof contentTypeName !== 'string') {
      const tables = contentTypeName.map(name => {
        if(contentTypeName.indexOf(name) === contentTypeName.length - 1) {
          // no comma if its the last table in sql statement
          return `${name}s`;
        } else {
          // comma if its not the last
          return `${name}s,`;
        }
      });
      return `DROP TABLE IF EXISTS ${tables.join('')}`;
    }
    return `DROP TABLE IF EXISTS ${contentTypeName}s`;
  }
};