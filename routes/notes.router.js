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
  const folderId = req.query.folderId;

  knex.select('notes.id', 'title', 'content')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .modify(function (queryBuilder) {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(function (queryBuilder) {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
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
  const folderId = req.query.folderId;
  knex
    .select('id', 'title', 'content')
    .from('notes')
    .modify(queryBuilder => {
      queryBuilder.where({id : idToFind});
    })
    .modify(function (queryBuilder) {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
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
  const updateableFields = ['title', 'content', 'folder_id'];

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

  let noteId;

  knex('notes')
    .where('id', idToUpdate)
    .update(updateObj)
    .returning('id')
    .then(([id]) => {
      noteId = id;
      // Using the new id, select the new note and the folder
      return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

// Post (insert) an item
router.post('/notes', (req, res, next) => {
  const { title, content, folder_id } = req.body;
  const newItem = {
    title: title,
    content: content,
    folder_id: folder_id};
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  let noteId;
  knex
    .insert(newItem)
    .into('notes')
    .returning('id')
    .then(([id]) => {
      noteId = id;
      // Using the new id, select the new note and the folder
      return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
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
