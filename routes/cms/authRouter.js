// import dependencies
const express = require('express');

// import controllers
const authController = require('../../controllers/authController.js');
const auth = require('../../authModule/auth');

// create auth router
const authRouter = express.Router();

// GET /auth
authRouter.get('/get-user', authController.getUser);

// POST /login
authRouter.post('/login', auth.login);

// export auth router for use in server.js
module.exports = authRouter;