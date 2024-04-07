const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    venue_name: String,
    city: String,
    state: String,
    capacity: Number,
    contact_info: String
});

module.exports = mongoose.model('Venue', venueSchema);