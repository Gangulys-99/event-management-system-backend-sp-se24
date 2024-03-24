// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    status: { type: Number, default: 0 } // Assuming 'status' is equivalent to 'status' field in MySQL
});

module.exports = mongoose.model('User', userSchema);
