// import db
const db = require('../../../config/db/db');

// import validators
const validateContentType = require('../../../validators/validateContentType');

// import JSON response helper
const ContentTypeRes = require('../../../utils/helpers/contentTypeJsonRes');

// import models
const ContentType = require('../../../models/ContentType');

// import SQL query builder helper
const contentTypeQuery = require('../../../utils/helpers/query_builders/contentTypeQuery');


module.exports = {
  createContentType(req, res, next) {
    const newContentType = new ContentType(req.body.name, req.body.fields);
    const validated = validateContentType(newContentType);

    if(validated !== true) {
      return res.status(400).json(new ContentTypeRes(validated, '', false, null));
    }

    db.query(contentTypeQuery.createTable(newContentType), (err, results) => {
      if(err) {
        return next(err);
      }
      if(results.warningCount > 0) {
        return res.json(new ContentTypeRes('A content type already exists with that name', '', false, null));
      }
      
      res.json(new ContentTypeRes(null, 'Content type successfully created', true, null));
    });
  }
};