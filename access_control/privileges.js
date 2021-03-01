const db = require("../config/db/db");

module.exports = {
  canCreate(user) {
    const privileges = JSON.parse(user.privileges);
    
    if(privileges.create) {
      return true;
    } else {
      return 'You do not have the correct privileges to perform this action';
    }
  },

  canRead(user, contentOwnerId) {
    const privileges = JSON.parse(user.privileges);
    
    if(privileges['read any']) {
      return true;
    }
    if(privileges['read own'] && user.id === contentOwnerId) {
      return true;
    }

    return 'You do not have the correct privileges to perform this action';
  },

  canUpdate(user, contentOwnerId) {
    const privileges = JSON.parse(user.privileges);
    
    if(privileges['update any']) {
      return true;
    }
    if(privileges['update own'] && user.id === contentOwnerId) {
      return true;
    }

    return 'You do not have the correct privileges to perform this action';
  },

  canDelete(user, contentOwnerId) {
    const privileges = JSON.parse(user.privileges);
    
    if(privileges['delete any']) {
      return true;
    }
    if(privileges['delete own'] && user.id === contentOwnerId) {
      return true;
    }

    return 'You do not have the correct privileges to perform this action';
  },

  canReadAll(user) {
    const privileges = JSON.parse(user.privileges);
    
    if(privileges['read any']) {
      return true;
    } else {
      return 'You do not have the correct privileges to perform this action';
    }
  }
};