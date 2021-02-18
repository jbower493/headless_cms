module.exports = class {
  constructor(error, message, success) {
    this.error = error;
    this.message = message;
    this.success = success;
    this.content = null;
  }
};