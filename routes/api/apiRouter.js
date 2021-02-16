// import dependencies
const express = require('express');

// import controllers
const usersController = require('../../controllers/api/users/usersController.js');
const contentTypesController = require('../../controllers/api/content/contentTypesController.js');

// import access control methods
const access = require('../../access_control/accessControl');

// create users router
const apiRouter = express.Router();


/*
User routes
*/

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


/*
Content Type routes
*/

// POST /api/content-type
// ACCESS: logged in admin
apiRouter.post('/content-type', access.loggedInAdmin, contentTypesController.createContentType);

// GET /api/content-type/:name
// ACCESS: logged in USER
apiRouter.get('/content-type/:name', access.loggedInUser, contentTypesController.getUser);


module.exports = apiRouter;