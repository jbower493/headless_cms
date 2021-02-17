module.exports = class {
  constructor(error, message, success, dataName, data) {
    this.error = error;
    this.message = message;
    this.success = success;
    this.data = {
      [dataName]: data
    };
  }
};