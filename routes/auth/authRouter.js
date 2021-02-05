// import dependencies
const express = require('express');

// import controllers
const authController = require('../../controllers/authController.js');

// create auth router
const authRouter = express.Router();


// GET /auth
// ACCESS: public
authRouter.get('/get-user', authController.getUser);

// POST /login
// ACCESS: not logged in, USER
authRouter.post('/login', authController.login);

// GET /logout
// ACCESS: logged in, USER
authRouter.get('/logout', authController.logout);


// export auth router for use in server.js
module.exports = authRouter;