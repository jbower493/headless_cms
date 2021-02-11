// import dependencies
const express = require('express');

// import controllers
const usersController = require('../../controllers/api/users/usersController.js');

// import access control methods
const access = require('../../access_control/accessControl');

// create users router
const apiRouter = express.Router();


// User routes

// POST /api/user
// ACCESS: logged in ADMIN
apiRouter.post('/user', access.loggedInAdmin, usersController.createUser);

// GET /api/user/:id
// ACCESS: logged in ADMIN
apiRouter.get('/user/:id', access.loggedInAdmin, usersController.getUser);

// PUT /api/user/:id
// ACCESS: logged in ADMIN
apiRouter.put('/user/:id', access.loggedInAdmin, usersController.updateUser);

// DELETE /api/user/:id
// ACCESS: logged in ADMIN
apiRouter.delete('/user/:id', access.loggedInAdmin, usersController.deleteUser);

// GET /api/users
// ACCESS: logged in ADMIN
apiRouter.get('/users', access.loggedInAdmin, usersController.getAllUsers);


// Resources routes


module.exports = apiRouter;