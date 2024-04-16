const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activity_name: String,
    venue_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue',
        required: true
    },
    total_capacity: Number,
    current_capacity: {
        type: Number,
        default: 0
    },
    address: String,
    date: Date,
    start_time: String,
    end_time: String
});

module.exports = mongoose.model('Activity', activitySchema);