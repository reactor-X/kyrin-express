var mongoose = require('mongoose');
var UserSchema = mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String,
    username: String,
    city: String,
    street_address: String,
});
UserSchema.methods.setName = function (fname, lname) {
    this.fname = fname;
    this.lname = lname;
};
UserSchema.methods.getName = function () {
    return this.fname + " " + this.lname;
};
UserSchema.methods.getUsername = function () {
    return this.username;
};
UserSchema.methods.setUsername = function (username) {
    this.username = username;
};
UserSchema.methods.getFname = function () {
    return this.fname;
};
UserSchema.methods.getLname = function () {
    return this.lname;
};
UserSchema.methods.getEmail = function () {
    return this.email;
};
UserSchema.methods.setEmail = function (email) {
    this.email = email;
};
UserSchema.methods.getPassword = function () {
    return this.password;
};
UserSchema.methods.setPassword = function (password) {
    this.password = password;
};
UserSchema.methods.getCity = function () {
    return this.city;
};
UserSchema.methods.setCity = function (city) {
    this.city = city;
};
UserSchema.methods.getStreetAddress = function () {
    return this.street_address;
};
UserSchema.methods.setStreetAddress = function (s_address) {
    this.street_address = s_address;
};
var User = mongoose.model('User', UserSchema);
module.exports = User;
