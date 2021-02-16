// import db
const db = require('../../../config/db/db');

// import validators
const validateContentType = require('../../../validators/validateContentType');
const allLettersOrUnderscore = require('../../../validators/allLettersOrUnderscore');

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
  },

  getUser(req, res, next) {
    const { name } = req.params;

    if(!allLettersOrUnderscore(name)) {
      return res.status(400).json(new ContentTypeRes('Name parameter must contain only lowercase letters or underscores', '', false, null));
    }

    const plural = `${name}s`;
    db.query(`SHOW COLUMNS FROM headless_cms_test.${plural}`, (err, results) => {
      if(err) {
        if(err.code === 'ER_NO_SUCH_TABLE') {
          return res.json(new ContentTypeRes('No content type with that name exists', '', false, null));
        } else {
          return next(err);
        }
      }

      // remove id field from response
      results.forEach(field => {
        if(field.Field === 'id') {
          results.splice(results.indexOf(field), 1);
        }
      });

      // map results to a valid content type object
      const responseFields = results.map(field => {
        const name = field.Field;
        let type;
        let required = false;

        if(field.Type.includes('int')) {
          type = 'int';
        } else {
          type = field.Type;
        }
        if(field.Null === 'NO') {
          required = true;
        }

        return {
          name,
          type,
          required
        };
      });

      const responseContentType = {
        name,
        fields: responseFields
      };

      res.json(new ContentTypeRes(null, 'Content Type successfully fetched', true, responseContentType));
    })
  }
};