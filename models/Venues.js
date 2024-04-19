const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    v_name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    sport: {
        type: String,
        required: true
    },
    total_capacity: {
        type: Number,
        required: true
    },
    total_cost: {
        type: Number,
        required: true
    },
    closed: {
        type: Boolean,
        default: false // Default value is false
    },
    bookings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: Date,
        startTime: String,
        endTime: String
    }],
    reviews: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        review: String
    }],
    bookmarks: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }]
});

module.exports = mongoose.model('Venue', venueSchema);
