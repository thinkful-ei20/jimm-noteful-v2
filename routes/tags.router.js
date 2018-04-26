'use strict';
const express = require('express');
const knex = require('../knex');
const router = express.Router();

router.get('/tags', (req, res, next) => {
  knex.select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/tags/:id', (req, res, next) =>{
  const idToFind = req.params.id;
  knex.select('id', 'name')
    .from('tags')
    .modify(queryBuilder => {
      queryBuilder.where({id : idToFind});
    })
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => next(err));
});


/* ========== POST/CREATE ITEM ========== */
router.post('/tags', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then((results) => {
      // Uses Array index solution to get first item in results array
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

router.delete('/tags/:id', (req, res, next) => {
  const idToDelete = req.params.id;

  knex('tags')
    .where('id', idToDelete)
    .del()
    .then(()=>{res.sendStatus(204);})
    .catch(err => {
      console.error(err);
    });
});

module.exports = router;