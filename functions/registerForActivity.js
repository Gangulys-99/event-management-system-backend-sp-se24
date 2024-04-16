
const Activity = require('../models/Activity');

async function registerForActivity(activityId, userId) {
    try {
        const activity = await Activity.findById(activityId);
        if (!activity) {
            throw new Error('Activity not found');
        }

        // Check if the activity is already full
        if (activity.current_capacity >= activity.total_capacity) {
            throw new Error('Activity is full');
        }

        // Increment the current capacity and save the activity
        activity.current_capacity++;
        await activity.save();

        // Implement registration logic here

    } catch (error) {
        throw error;
    }
}

module.exports = registerForActivity;