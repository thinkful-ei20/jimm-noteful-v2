'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

//const data = require('../db/notes');
//const simDB = require('../db/simDB');
//const notes = simDB.initialize(data);

const knex = require('../knex');

// Get All (and search by query)
router.get('/notes', (req, res, next) => {
  const searchTerm = req.query.searchTerm;

  knex.select('notes.id', 'title', 'content').from('notes')
    .modify(function (queryBuilder) {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

// Get a single item
router.get('/notes/:id', (req, res, next) => {
  const idToFind = req.params.id;
  knex
    .select('id', 'title', 'content')
    .from('notes')
    .modify(queryBuilder => {
      queryBuilder.where({id : idToFind});
    })
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => {
      next(err);
    });
});

// Put update an item
router.put('/notes/:id', (req, res, next) => {
  const idToUpdate = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .where({id : idToUpdate})
    .update(updateObj, ['title', 'id', 'content'])
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => {
      next(err);
    });
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .insert(newItem, ['id', 'title', 'content'])
    .into('notes')
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => {
      console.error(err);
    });
});

// Delete an item
router.delete('/notes/:id', (req, res, next) => {
  const idToDelete = req.params.id;

  knex('notes')
    .where('id', idToDelete)
    .del()
    .then(()=>{res.sendStatus(204);})
    .catch(err => {
      console.error(err);
    });
});

module.exports = router;
