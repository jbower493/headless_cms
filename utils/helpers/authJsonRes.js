module.exports = class JsonRes {
  constructor(error, message, success, user) {
    this.error = error;
    this.message = message;
    this.success = success;
    this.user = user;
  }
};