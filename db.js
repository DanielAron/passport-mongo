var mongoose = require('mongoose');
var db = process.env.MONGO_URL || 'mongodb://localhost/test';
mongoose.connect(db);