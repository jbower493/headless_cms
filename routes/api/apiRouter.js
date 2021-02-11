// import dependencies
const express = require('express');

// import controllers
const usersController = require('../../controllers/api/users/usersController.js');

// import access control methods
const access = require('../../access_control/accessControl');

// create users router
const apiRouter = express.Router();


// POST /api/user
// ACCESS: logged in ADMIN
apiRouter.post('/user', access.loggedInAdmin, usersController.createUser);

// GET /api/user/:id
// ACCESS: logged in ADMIN
apiRouter.get('/user/:id', access.loggedInAdmin, usersController.getUser);

// PUT /api/user/:id
// ACCESS: logged in ADMIN
apiRouter.put('/user/:id', access.loggedInAdmin, usersController.updateUser);


module.exports = apiRouter;