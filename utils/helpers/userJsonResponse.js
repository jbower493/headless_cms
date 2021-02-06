module.exports = class JsonRes {
  constructor(error, message, success) {
    this.error = error;
    this.message = message;
    this.success = success;
  }
};