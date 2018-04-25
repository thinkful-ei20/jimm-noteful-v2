'use strict';

const express = require('express');
const knex = require('../knex');

const router = express.Router();

router.get('/folders', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/folders/:id', (req, res, next) =>{
  const idToFind = req.params.id;
  knex.select('id', 'name')
    .from('folders')
    .modify(queryBuilder => {
      queryBuilder.where({id : idToFind});
    })
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => next(err));
});

router.put('/notes/:id', (req, res, next) => {
  const idToUpdate = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title'];

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

  knex('folders')
    .where({id : idToUpdate})
    .update(updateObj, ['title', 'id'])
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => {
      next(err);
    });
});

router.post('/folders', (req, res, next) => {
  const { name } = req.body;

  const newItem = {name : name};
  /***** Never trust users - validate input *****/
  if (!newItem.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .insert(newItem, ['name'])
    .into('folders')
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => {
      next(err);
    });
});

router.delete('/folders/:id', (req, res, next) => {
  const idToDelete = req.params.id;

  knex('folders')
    .where('id', idToDelete)
    .del()
    .then(()=>{res.sendStatus(204);})
    .catch(err => {
      console.error(err);
    });
});


module.exports = router;