// import db
const db = require('../../../config/db/db');

// import validators
const validateContentType = require('../../../validators/validateContentType');
const allLettersOrUnderscore = require('../../../validators/allLettersOrUnderscore');

// import JSON response helper
const ContentTypeRes = require('../../../utils/helpers/contentTypeJsonRes');

// import models
const ContentType = require('../../../models/ContentType');

// import helpers
const contentTypeQuery = require('../../../utils/helpers/query_builders/contentTypeQuery');
const dbResultsToContentType = require('../../../utils/helpers/content_type_helpers/resultsToContentType');


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

  getContentType(req, res, next) {
    const { name } = req.params;

    if(!allLettersOrUnderscore(name)) {
      return res.status(400).json(new ContentTypeRes('Name parameter must contain only lowercase letters or underscores', '', false, null));
    }

    const plural = `${name}s`;
    const databaseName = db.config.database;
    db.query(`SHOW COLUMNS FROM ${databaseName}.${plural}`, (err, results) => {
      if(err) {
        if(err.code === 'ER_NO_SUCH_TABLE') {
          return res.json(new ContentTypeRes('No content type with that name exists', '', false, null));
        } else {
          return next(err);
        }
      }

      // // remove id field from response
      // results.forEach(field => {
      //   if(field.Field === 'id') {
      //     results.splice(results.indexOf(field), 1);
      //   }
      // });

      // // map results to a valid content type object
      // const responseFields = results.map(field => {
      //   const name = field.Field;
      //   let type;
      //   let required = false;

      //   if(field.Type.includes('int')) {
      //     type = 'int';
      //   } else {
      //     type = field.Type;
      //   }
      //   if(field.Null === 'NO') {
      //     required = true;
      //   }

      //   return {
      //     name,
      //     type,
      //     required
      //   };
      // });

      // const responseContentType = {
      //   name,
      //   fields: responseFields
      // };

      const responseContentType = dbResultsToContentType(results, name);

      res.json(new ContentTypeRes(null, 'Content Type successfully fetched', true, responseContentType));
    })
  },

  // updateContentType(req, res, next) {
  //   const { name } = req.params;

  //   if(!allLettersOrUnderscore(name)) {
  //     return res.status(400).json(new ContentTypeRes('Name parameter must contain only lowercase letters or underscores', '', false, null));
  //   }

  //   const newContentType = new ContentType(req.body.name, req.body.fields);
  //   const validated = validateContentType(newContentType);

  //   if(validated !== true) {
  //     return res.status(400).json(new ContentTypeRes(validated, '', false, null));
  //   }

  //   const plural = `${name}s`;
  //   db.query(`SHOW COLUMNS FROM headless_cms_test.${plural}`, (err, results) => {
  //     if(err) {
  //       if(err.code === 'ER_NO_SUCH_TABLE') {
  //         return res.json(new ContentTypeRes('No content type with that name exists', '', false, null));
  //       } else {
  //         return next(err);
  //       }
  //     }
  //     res.send('Hi');
  //   });
  // },

  deleteContentType(req, res, next) {
    const { name } = req.params;

    if(!allLettersOrUnderscore(name)) {
      return res.status(400).json(new ContentTypeRes('Name parameter must contain only lowercase letters or underscores', '', false, null));
    }

    db.query(contentTypeQuery.dropTable(name), (err, results) => {
      if(err) {
        return next(err);
      }

      if(results.warningCount > 0) {
        return res.json(new ContentTypeRes('No content type with that name exists', '', false, null));
      }

      res.json(new ContentTypeRes(null, 'Content type successfully deleted', true, null));
    })
  },

  getAllContentTypes(req, res, next) {
    db.query('SHOW TABLES', (err, results) => {
      if(err) {
        return next(err);
      }
      
      // map database query results to an object with name: [table name] property
      const responseContentTypes = results.map(result => {
        const pluralName = result[`Tables_in_${db.config.database}`];
        const singularNameArray = pluralName.split('');
        if(pluralName[pluralName.length - 1] === 's') {
          singularNameArray.pop();
        }
        return { name: singularNameArray.join('') };
      });
      // remove tables that are not content types from the response object (had to do it twice beacuse for some unknown reason it wouldn't find the users item the first time round)
      responseContentTypes.forEach(item => {
        if(item.name === 'session') {
          responseContentTypes.splice(responseContentTypes.indexOf(item), 1);
        }
      });
      responseContentTypes.forEach(item => {
        if(item.name === 'user') {
          responseContentTypes.splice(responseContentTypes.indexOf(item), 1);
        }
      });

      res.json({
        error: null,
        message: 'Content types successfully fetched',
        success: true,
        contentTypes: responseContentTypes
      });
    })
  }
};