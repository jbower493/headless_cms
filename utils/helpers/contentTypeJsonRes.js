module.exports = class ContentTypeJsonRes {
  constructor(error, message, success, contentType) {
    this.error = error;
    this.message = message;
    this.success = success;
    this.contentType = contentType;
  }
}