// import dependencies
const express = require('express');

// import controllers
const usersController = require('../../controllers/api/users/usersController.js');
const contentTypesController = require('../../controllers/api/content/contentTypesController.js');
const contentController = require('../../controllers/api/content/contentController.js');

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
apiRouter.get('/content-type/:name', access.loggedInUser, contentTypesController.getContentType);

// This is commented out until i figure out how to dynamically change a table
// // PUT /api/content-type/:name
// // ACCESS: logged in ADMIN
// apiRouter.put('/content-type/:name', access.loggedInAdmin, contentTypesController.updateContentType);

// DELETE /api/content-type/:name
// ACCESS: logged in ADMIN
apiRouter.delete('/content-type/:name', access.loggedInAdmin, contentTypesController.deleteContentType);

// GET /api/content-types
// ACCESS: logged in USER
apiRouter.get('/content-types', access.loggedInUser, contentTypesController.getAllContentTypes);


/*
Content routes
*/

// POST /api/content/:name
// ACCESS: logged in USER
apiRouter.post('/content/:name', access.loggedInUser, contentController.createContent);

// GET /api/content/:name/:id
// ACCESS: logged in USER
apiRouter.get('/content/:name/:id', access.loggedInUser, contentController.getContent);

// PUT /api/content/:name/:id
// ACCESS: logged in USER
apiRouter.put('/content/:name/:id', access.loggedInUser, contentController.updateContent);

// DELETE /api/content/:name/:id
// ACCESS: logged in USER
apiRouter.delete('/content/:name/:id', access.loggedInUser, contentController.deleteContent);


module.exports = apiRouter;