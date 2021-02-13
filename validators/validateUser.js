module.exports = (user) => {
  if(!user.username || !user.password || !user.role || !user.privileges) {
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
  
  if(user.privileges !== Object(user.privileges)) {
    return 'Privileges must be an object';
  }
  
  const keys = Object.keys(user.privileges);
  const allowedPrivs = ['create', 'read own', 'read any', 'update own', 'update any', 'delete own', 'delete any'];
  if(keys.length !== 7) {
    return 'Privileges object must have all the correct keys and no more';
  }
  let error;
  for(let i = 0; i < allowedPrivs.length; i++) {
    if(!keys.includes(allowedPrivs[i])) {
      error = 'Privileges object must have all the correct keys and no more';
    }
  }

  if(error) {
    return error;
  }
  return true;
};