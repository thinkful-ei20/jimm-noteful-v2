'use strict';

const knex = require('../knex');

let searchTerm = 'gaga';
knex
  .select('id', 'title', 'content')
  .from('notes')
  .modify(queryBuilder => {
    if (searchTerm) {
      queryBuilder.where('title', 'like', `%${searchTerm}%`);
    }
  })
  .orderBy('notes.id')
  .then(results => {
    console.log(JSON.stringify(results, null, 2));
  })
  .catch(err => {
    console.error(err);
  });

let searchId = 1002;
knex
  .select('id', 'title', 'content')
  .from('notes')
  .modify(queryBuilder => {
    queryBuilder.where({id : searchId});
  })
  .then(results => {
    console.log(JSON.stringify(results[0]));
  })
  .catch(err => {
    console.error(err);
  });

let updatedData = {title : 'Look Ma I Got A New Name'};
knex('notes')
  .where({id : searchId})
  .update(updatedData, ['title', 'id', 'content'])
  .then(results => {
    console.log(JSON.stringify(results[0]));
  })
  .catch(err => {
    console.error(err);
  });

let newNote = {title : 'New Name Galore', content : 'content contrnt cintatn cnidnfs'};
knex
  .insert(newNote, ['id', 'title', 'content'])
  .into('notes')
  .then(results => {
    console.log(JSON.stringify(results[0]));
  })
  .catch(err => {
    console.error(err);
  });

knex('notes')
  .where('id', searchId)
  .del()
  .catch(err => {
    console.error(err);
  });