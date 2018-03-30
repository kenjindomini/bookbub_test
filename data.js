'use strict';

const fs = require('fs');
const util = require('util');
const _ = require('lodash');

let booksFile;
let genre_keyword_valueFile;

const readBooks = function readBooks(sort = 'asc') {
  return new Promise((resolve, reject) => {
    sort = sort.toLowerCase();
    if (sort !== 'asc' || sort !== 'desc') {
      sort = 'asc';
    }
    fs.readFile(booksFile, (err, bookJson) => {
      if(err) {
        console.log(`Error reading books database: ${util.inspect(err, false, null)}`);
        reject(err);
      } else {
        let books = JSON.parse(bookJson);
        books = _.sortBy(books, ['title'], sort);
        resolve(books);
      }
    });
  });
};

const readGenreKeywords = function readGenreKeyworks() {
  return new Promise((resolve, reject) => {
    fs.readFile(genre_keyword_valueFile, 'utf8', (err, gkv) => {
      if(err) {
        console.log(`Error loading genre keyword weights: ${util.inspect(err, false, null)}`);
        reject(err);
      } else {
        gkv = gkv.split(/\r?\n/);
        gkv = gkv.map((s) => {
          return s.split(', ');
        });
        let genreKeywords = {};
        gkv.forEach((x, i) => {
          if (i > 0) {
            if(_.isUndefined(genreKeywords[x[1]])) {
              genreKeywords[x[1]] = {};
              genreKeywords[x[1]].genreWeights = [];
            }
            genreKeywords[x[1]].genreWeights.push([x[0], x[2]]);
          }
        });
        resolve(genreKeywords);
      }
    });
  });
};

const setPaths = function setPaths(_booksFile, _genre_keyword_valueFile) {
  booksFile = _booksFile;
  genre_keyword_valueFile = _genre_keyword_valueFile;
}
module.exports = {
  readBooks: readBooks,
  readGenreKeywords: readGenreKeywords,
  setPaths: setPaths
};