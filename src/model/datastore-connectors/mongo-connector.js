"use strict";
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function () {
    // we're connected!
    console.log('Datastore connected.');
});
mongoose.connection.on('close', function () {
    // we're connected!
    console.log('Datastore disconnected.');
});
exports.Mongoose = mongoose;
