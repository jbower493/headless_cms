// import dependencies
const express = require('express');

// import users controller
const usersController = require('../controllers/usersController.js');

// create users router
const usersRouter = express.Router();

// GET /users
usersRouter.get("/", usersController.test);

// export users router for use in server.js
module.exports = usersRouter;