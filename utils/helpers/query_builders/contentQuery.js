module.exports = {
  insertContent(content, contentTypeName) {
    const fields = Object.keys(content);
    const fieldsString = fields.join(', ');
    const questionMarks = [];
    for(let i = 0; i < fields.length; i++) {
      questionMarks.push('?, ');
    }
    const questionMarksString = questionMarks.join('');


    return `INSERT INTO ${contentTypeName}s (${fieldsString}, owner_id) VALUES (${questionMarksString}?)`;
  },

  updateContent(content, contentTypeName) {
    const fields = Object.keys(content);
    const insert = fields.map(field => `${field} = ?`).join(', ');

    return `UPDATE ${contentTypeName}s SET ${insert} WHERE id = ?`;
  }
};