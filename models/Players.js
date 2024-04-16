const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    player_name: {
        type: String,
        required: true
    },
    sport: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    level: {
        type: String
    },
    available: {
        type: Boolean
    }
});

module.exports = mongoose.model('Player', playerSchema);
