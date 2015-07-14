var mongoose = require('mongoose');
var fonkappSchema = new mongoose.Schema({
    name: String,
    category: String,
    company: String,
    flickr: String,
    mcdevcode: String,
    addsense: String,
    user: String,
    apkurl: String,
    weburl: String
});
mongoose.model('Fonkapp', fonkappSchema);