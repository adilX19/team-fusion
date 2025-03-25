const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const databasePath = path.resolve(__dirname, '../database.sqlite')
const database = new sqlite3.Database(databasePath, (error) => {
    if (error) {
        console.log('Error while connecting to the database', error.message)
    } else {
        console.log("Connection successfull...")
    }
});

module.exports = database;