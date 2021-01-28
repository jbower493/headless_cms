module.exports = (user) => {
  if(typeof user.username !== 'string') {
    return 'username not string';
  }
  if(user.username.length > 30) {
    return 'username too long';
  }
  if(typeof user.password !== 'string') {
    return 'password not string';
  }
  if(user.password.length < 5) {
    return 'password too short';
  }
  return true;
};