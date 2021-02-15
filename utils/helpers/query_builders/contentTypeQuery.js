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

    return `CREATE TABLE IF NOT EXISTS ${contentType.name}s (id INT NOT NULL AUTO_INCREMENT, ${columns}PRIMARY KEY (id))`;
  },

  dropTable(contentTypeName) {
    return `DROP TABLE ${contentTypeName}s`;
  }
};