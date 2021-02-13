module.exports = class ContentType {
  constructor(name, description, fields) {
    this.name = name;
    this.description = description;
    this.fields = fields;
  }
};