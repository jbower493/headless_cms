// import dependencies
const express = require('express');

// import controllers
const usersController = require('../../controllers/api/users/usersController.js');

// import access control methods
const access = require('../../access_control/accessControl');

// create users router
const apiRouter = express.Router();


// POST /api/user
// ACCESS: logged in, admin
apiRouter.post('/user', access.loggedInAdmin, usersController.createUser);


module.exports = apiRouter;