const Activity = require('../models/Activity');

async function createActivity(userId, activity_name, venue_id, total_capacity, address, date, start_time, end_time) {
    try {
        const activity = new Activity({
            userId,
            activity_name,
            venue_id,
            total_capacity,
            address,
            date,
            start_time,
            end_time
        });

        // Check if the activity's total capacity has been reached
        const registrationsCount = await Activity.countDocuments({ activityId: activity._id });
        if (registrationsCount >= total_capacity) {
            throw new Error('Activity is already full');
        }

        await activity.save();
        return activity;
    } catch (error) {
        throw error;
    }
}

module.exports = createActivity;