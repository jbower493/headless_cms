module.exports = class {
  constructor(error, message, success, dataName, data) {
    this.error = error;
    this.message = message;
    this.success = success;
    if(data === null) {
      this.data = null;
    } else {
      this.data = {
        [dataName]: data
      };
    }
  }
};