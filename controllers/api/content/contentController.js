// import db
const db = require('../../../config/db/db');

// import validators
const validateContent = require('../../../validators/validateContent');
const allLettersOrUnderscore = require('../../../validators/allLettersOrUnderscore');

// import JSON response helper
const ContentRes = require('../../../utils/helpers/contentJsonRes');
const GetContentRes = require('../../../utils/helpers/getContentJsonRes');

// import helpers
const contentQuery = require('../../../utils/helpers/query_builders/contentQuery');
const dbResultsToContentType = require('../../../utils/helpers/content_type_helpers/resultsToContentType');


module.exports = {
  createContent (req, res, next) {
    const contentTypeName = req.params.name;
    const newContent = req.body;

    // return error if name param contains bad chars
    if(!allLettersOrUnderscore(contentTypeName)) {
      return res.status(400).json(new ContentRes('Name param must be a valid content type name', '', false));
    }

    // get relevant content type schema from db
    const plural = `${contentTypeName}s`;
    const databaseName = db.config.database;

    db.query(`SHOW COLUMNS FROM ${databaseName}.${plural}`, (err, results) => {
      if(err) {
        if(err.code === 'ER_NO_SUCH_TABLE') {
          return res.status(400).json(new ContentRes('Content type does not exist', '', false));
        } else {
          return next(err);
        }
      } 
      // if no error in db call, continue with validation

      // map db results to a content type object
      const contentType = dbResultsToContentType(results, contentTypeName);
      
      // validate new content object against its content type object
      const validated = validateContent(newContent, contentType);
      
      if(validated !== true) {
        return res.status(400).json(new ContentRes(validated, '', false));
      }

      // content is valid, everything else is fine, insert the content and send success response
      
      const queryParams = Object.keys(newContent).map(field => newContent[field]);
      queryParams.push(req.user.id);
      
      db.query(contentQuery.insertContent(newContent, contentTypeName), queryParams, (err, results) => {
        if(err) {
          return next(err);
        }
        res.json(new ContentRes(null, 'Content successfully created', true));
      });
    });
  },

  getContent(req, res, next) {
    const { name, id } = req.params;

    // return error if name param contains bad chars
    if(!allLettersOrUnderscore(name)) {
      return res.status(400).json(new GetContentRes('Name param must be a valid content type name', '', false, name, null));
    }

    db.query(`SELECT * FROM ${name}s WHERE id = ?`, [id], (err, results) => {
      if(err) {
        if(err.code === 'ER_NO_SUCH_TABLE') {
          return res.status(400).json(new GetContentRes('No content type with that name exists', '', false, name, null));
        } else {
          return next(err);
        }
      }
      // if no error, continue

      if(results.length === 0) {
        return res.status(400).json(new GetContentRes('No content with that id exists', '', false, name, null));
      }

      // remove id from content object
      delete results[0].id;
      delete results[0].owner_id;

      res.json(new GetContentRes(null, 'Content successfully fetched', true, name, results[0]))
    });
  },

  updateContent(req, res, next) {
    const { name, id } = req.params;

    // return error if name param contains bad chars
    if(!allLettersOrUnderscore(name)) {
      return res.status(400).json(new GetContentRes('Name param must be a valid content type name', '', false, name, null));
    }




    res.send('Hi')
  }
};