'use strict';

const program = require('commander');
const util = require('util');
const data = require('./data');
const _ = require('lodash');

program
  .version('1.0.0')
  .option('-b, --books [path]', 'path to books json file')
  .option('-g, --genreKeywords [path]', 'path to genre-keyword-points csv file')
  .parse(process.argv);

const main = function main() {
  let promises = [];
  let books;
  let genreWeights;
  data.setPaths(program.books, program.genreKeywords);
  promises.push(data.readBooks().then((_books) => {
    books = _books;
  }).catch((err) => {
    console.log(`Error in data.readBooks(): ${util.inspect(err, false, null)}`);
  }));
  promises.push(data.readGenreKeywords().then((_gkv) => {
    genreWeights = _gkv;
  }).catch((err) => {
    console.log(`Error in data.readGenreKeywords(): ${util.inspect(err, false, null)}`);
  }));
  Promise.all(promises).then(() => {
    let bookGenres = calcGenres(books, genreWeights);
    renderResults(bookGenres);
    return 0;
  }).catch((err) => {
    console.log(`Could not retrieve all required data: ${util.inspect(err, false, null)}`);
    return 1;
  });
};

const calcGenres = function calculateGenres(books, genreWeights) {
  let bookGenres = [];
  let keywords = Object.keys(genreWeights);
  let keywordRegex = buildKeywordRegex(keywords);
  books.forEach((book) => {
    let bookGenre = {
      book: book,
      genres: []
    };
    let matches = book.description.match(keywordRegex);
    let matchedKeywords = [];
    if (matches !== null) {
      matches.forEach((match) => {
        matchedKeywords.push(match);
      });
      bookGenre.genres = calcGenreScore(matchedKeywords, genreWeights);
    }
    bookGenres.push(bookGenre);
  });
  return bookGenres;
};

const renderResults = function renderResults(bookGenres) {
  bookGenres.forEach((book, i) => {
    if (i) {
      console.log('\n');
    }
    console.log(book.book.title);
    book.genres.forEach((genre, i) => {
      console.log(`${genre[0]}, ${genre[1]}`);
    });
  })
};

const buildKeywordRegex = function buildKeywordRegex(keywords) {
  let regex = [];
  keywords.forEach((keyword) => {
    // regex.push(`(\\b${keyword}\\b)`); //dashes are not word boundries so this does not result in the desired findings with the sample data set.
    regex.push(`(${keyword})`); //TODO: Is this what is desired? small words could show up in larger words with vastly different meanings.
  });
  return new RegExp(regex.join('|'), 'gim');
};

const calcGenreScore = function calculateGenreScore(matchedKeywords, genreKeywords) {
  let genres = {};
  let uniqueKeywords = new Set(matchedKeywords);
  uniqueKeywords = [...uniqueKeywords];
  //TODO: have a think about whether these two forEach loops with the same nested forEach loop can be condensed.
  uniqueKeywords.forEach((uniqueKeyword) => {
    let genrePointPairs = genreKeywords[uniqueKeyword].genreWeights;
    genrePointPairs.forEach((genrePointPair) => {
      let genre = genrePointPair[0];
      let points = genrePointPair[1];
      if(genres.hasOwnProperty(genre) === false) {
        genres[genre] = {};
        genres[genre].points = [];
      }
      genres[genre].points.push(points);
    });
  });
  matchedKeywords.forEach((matchedKeyword) => {
    let genrePointPairs = genreKeywords[matchedKeyword].genreWeights;
    genrePointPairs.forEach((genrePointPair) => {
      let genre = genrePointPair[0];
      if(_.isUndefined(genres[genre].totalMatches)) {
        genres[genre].totalMatches = 0;
      }
      genres[genre].totalMatches++;
    });
  });
  let genreScores = [];
  for(let genre in genres) {
    let genreSum = genres[genre].points.reduce((next, current) => parseInt(next) + parseInt(current));
    let genreAvg = genreSum / genres[genre].points.length;
    let score = genres[genre].totalMatches * genreAvg;
    genreScores.push([genre, score]);
  }
  return genreScores;
};

// initialize script execution
main();