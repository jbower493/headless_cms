module.exports = {
  notLoggedIn(req, res, next) {
    if(req.user) {
      res.status(403).json({ error: "Access denied", success: false });
    } else {
      next();
    }
  },

  loggedInUser(req, res, next) {
    if(req.user) {
      next();
    } else {
      res.status(403).json({ error: "Access denied", success: false });
    }
  },

  loggedInAdmin(req, res, next) {
    if(req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: "Access denied", success: false });
    }
  }
};