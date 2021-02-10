// import dependencies
const express = require('express');

// import controllers
const authController = require('../../controllers/auth/authController.js');

// import access control methods
const access = require('../../access_control/accessControl');

// create auth router
const authRouter = express.Router();


// GET /auth/get-user
// ACCESS: PUBLIC
authRouter.get('/get-user', authController.getUser);

// POST /auth/login
// ACCESS: not logged in USER
authRouter.post('/login', access.notLoggedIn, authController.login);

// GET /auth/logout
// ACCESS: logged in USER
authRouter.get('/logout', access.loggedInUser, authController.logout);


// export auth router for use in server.js
module.exports = authRouter;