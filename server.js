const mongoose = require('mongoose');
const facilitiesHandler = require('./controllers/getData');

const DB_HOST = 'localhost';
const DB_NAME = 'sanna_code';
const DB_PORT = 27017;

let db;

//DB_HOST, DB_NAME, DB_PORT
mongoose.connect('mongodb://' + DB_HOST + ':' + DB_PORT + '/' + DB_NAME, {
    useMongoClient: true
});

db = mongoose.connection;

db.once('connected', function () {
    console.log('connection is ok');

    require('./models/index');

    facilitiesHandler.getData();
});

db.on('error', function(err){
    throw err;
});