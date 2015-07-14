var mongoose = require('mongoose');
var fonkappSchema = new mongoose.Schema({
    name: String,
    category: String,
    badge: Number,
    user: String,
    dob: { type: Date, default: Date.now },
    isloved: Boolean
});
mongoose.model('Fonkapp', fonkappSchema);