#Bookbub book genre test

Author: Keith Olenchak <keith.olenchak@gmail.com>

##Description
This application takes in two arguments a json file with an array of book objects containing at least a title and a description, and a csv with genre, keyword, points (a header is assumed so the first line is not evaluated). A genre score is calculated based on the total number of keywords it has show up in the description multiplied by the average point value of all unique keywords found for that genre. The results are then displayed to standard out.

##Execution
There are two options for executing this application. using node to execute the index.js file directly (requires node) or use one of the convienently packaged executables.
###Node
1) Install the latest node LTS, tested with 8.9.0 and 8.11.0
2) Clone repo
3) `npm install`
4) `node index.js -b <path to books json file> -g <path to genre keyword point csv>`

Example: `node index.js --books Resources/sample_book.json -g Resources/sample_genre_keyword_value.csv`
###Executables
1) Clone repo
2) Run executable for your environment
Example: `./index-macos --books Resources/sample_book.json -g Resources/sample_genre_keyword_value.csv`

##Remaining Tasks
- More granular error handling so any displayed errors would be displayed with more context
- Condense some loops to improve efficiency
- Revist data structures to see if they can be refactored to improve efficiency
- Revist regex to make sure it isn't matching undesired substrings
- Do validation on inputted file path's existence
- Do validation on contents of files to ensure they are the correct structure
- Loading files in to memory does not scale, would need to refactor to stream or read the parts presuming the data could not be offloaded to more efficient storage that supports paginated queries
