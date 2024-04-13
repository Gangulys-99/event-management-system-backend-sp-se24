const Venues = require('../models/Venues');

require('dotenv').config()


async function createVenue(userId, v_name, address, sport, total_capacity, total_cost, closed) {
    try {
        // Create a new venue document using the Venue model
        const venue = new Venues({
            userId,
            v_name,
            address,
            sport,
            total_capacity,
            total_cost,
            closed
        });

        // Save the venue to the database
        await venue.save();
    } catch (error) {
        throw error;
    }
}


module.exports = createVenue;