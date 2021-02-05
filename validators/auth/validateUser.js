module.exports = (user) => {
  if(!user.username || !user.password || !user.role) {
    return 'field(s) missing';
  }
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
  if(user.role !== 'user' || user.role !== 'admin') {
    return 'role must be "user" or "admin"'
  }
  return true;
};