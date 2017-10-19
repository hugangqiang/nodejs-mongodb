const mongoose = require('mongoose');
let bgsSchema = require('../schemas/bgs');

module.exports = mongoose.model('Bg',bgsSchema);