module.exports = class User {
  constructor(username, password, role, privileges) {
    this.username = username;
    this.password = password;
    this.role = role;
    this.privileges = privileges;
  }
};