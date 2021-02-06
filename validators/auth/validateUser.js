module.exports = (user) => {
  if(!user.username || !user.password || !user.role) {
    return 'Field(s) missing';
  }
  if(typeof user.username !== 'string') {
    return 'Username not string';
  }
  if(user.username.length > 30) {
    return 'Username too long';
  }
  if(typeof user.password !== 'string') {
    return 'Password not string';
  }
  if(user.password.length < 5) {
    return 'Password too short';
  }
  if(user.role !== 'user' && user.role !== 'admin') {
    return 'Role must be "user" or "admin"';
  }
  return true;
};