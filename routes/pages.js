const express = require("express");
const authController = require("../controllers/auth");
const venueController = require("../controllers/venues");
const router = express.Router();

router.get('/', authController.isLoggedIn, (req, res) => {
    res.send("homepage")
});

router.get("/register", (req, res) => {
    res.send("register")
})

router.get('/login', (req, res) => {
    res.send("login")
});

// router.get('/profile', authController.isLoggedIn, (req, res) => {
//     if (req.user) {
//         res.send("profile")

//     } else {
//         res.send("login")
//     }
// })

const Venue = require('../models/Venues');

router.get('/venue-list', async (req, res) => {
    try {
        const venues = await Venue.find();
        res.status(200).json(venues);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

//Invite friend API
const inviteFriend = require('../functions/inviteFriend.js');

router.post('/inviteFriend', async (req, res) => {
    try {
        const { friendEmail } = req.body;
        const name = 'Isha';
        console.log(name);
        console.log(friendEmail);
        await inviteFriend(name, friendEmail);
        res.status(200).json({ message: 'Successfully invited your friend!' });
    } catch (error) {
        res.status(400).json({ message: 'internal server error' });
    }

});

//profile
const User = require('../models/User');
router.get('/profile', authController.isLoggedIn, async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ email });
        if (user) {
            console.log(email);
            return res.status(200).json(user);
        } else {
            res.status(400).json({ message: 'user not found' })
        }

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

router.put('/profile', authController.isLoggedIn,  async (req, res) => {
    try {
        const updatedUser = req.body;
        if (!updatedUser || !updatedUser.username || !updatedUser.email || !updatedUser.role) {
            res.status(400).json({ error: 'Invalid data' });
            return;
        }
        else {
            const { username, email, role } = updatedUser;
            await User.updateOne({ email: email },
                {
                    $set: {
                        email: email,
                        username: username,
                        role: role
                    }
                });

            const updatedUserData = await findUserByEmail(email); 
            return res.status(200).json(updatedUserData);
        }
        // write code to update profile
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

async function findUserByEmail(email) {
    return await User.findOne({ email });
}

// venues
// Venue owner should be able to add his/her venue with all the relevant
// details on the website such as address, location, and available time slots
// with dates.user_id, reservation_type, vname, address, sport, total_capacity, total_cost, closed

const createVenue = require('../functions/createVenue.js');
router.post('/venue', authController.isLoggedIn, async (req, res) => {
    try {
        const { userId, v_name, address, sport, total_capacity, total_cost, closed } = req.body;
        console.log(req.user);
        console.log(req.user.role)
        // Check if the user is authenticated
        if (!req.user || req.user.role !== 'owner') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        await createVenue(userId, v_name, address, sport, total_capacity, total_cost, closed);
        res.status(200).json({ message: 'Successfully added venue' });
    } catch (error) {
        console.log(error)
        res.status(400).json({error});
    }

});

// open or close

router.put('/venue/:id',authController.isLoggedIn, async (req, res) => {
    try {
        const venueId = req.params.id;
        const { open } = req.body;

        // Find the venue by ID
        const venue = await Venue.findById(venueId);
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }
        console.log(req.user._id);
        console.log(venue.userId)
        // Check if the user is the owner of the venue
        if (venue.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update the venue's open status
        venue.closed = !open;
        console.log(open)
        await venue.save();

        const message = open ? 'opened' : 'closed';
        console.log(open)
        console.log(message)
        return res.status(200).json({ message: `Venue ${message} successfully` });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Add activity
const createActivity = require('../functions/createActivity.js');

router.post('/add-activity', authController.isLoggedIn, async (req, res) => {
    try {
        const { userId, activity_name, venue_id, total_capacity, address, date, start_time, end_time } = req.body;
        console.log(req.user);
        // console.log(req.user.role)
      
        
        await createActivity(userId, activity_name, venue_id, total_capacity, address, date, start_time,end_time);
        res.status(200).json({ message: 'Successfully added activity' });
    } catch (error) {
        console.log(error)
        res.status(400).json({error});
    }

});

// Register for activity 
router.post('/register-for-activity/:activityId', authController.isLoggedIn, async (req, res) => {
    try {
        const { activityId } = req.params;
        const userId = req.user._id;
        await registerForActivity(activityId, userId);
        res.status(200).json({ message: 'Successfully registered for activity' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
});


// Players Data

const Player = require('../models/User');

router.get('/player-list', async (req, res) => {
    try {
        // Fetch only the required fields
        const players = await Player.find({}, 'username sport age gender level available');

        res.status(200).json(players);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Book Venue
router.post('/book-venue', authController.isLoggedIn, async (req, res) => {
    try {
        const { venueId, bookDate, startTime, endTime } = req.body;
        const userId = req.user._id;

        // Find the venue by ID
        const venue = await Venue.findById(venueId);
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }

        // Check if the venue is closed
        if (venue.closed) {
            return res.status(400).json({ message: 'Venue is closed' });
        }

        // Check if the venue is already booked for the given time slot
        const isBooked = venue.bookings.some(booking =>
            booking.date.toDateString() === new Date(bookDate).toDateString() &&
            booking.startTime === startTime &&
            booking.endTime === endTime
        );

        if (isBooked) {
            return res.status(400).json({ message: 'Venue is already booked for the selected time slot' });
        }

        // Check if the venue is fully booked for the given date and time
        const totalBookings = venue.bookings.filter(booking =>
            booking.date.toDateString() === new Date(bookDate).toDateString() &&
            booking.startTime === startTime &&
            booking.endTime === endTime
        ).length;

        if (totalBookings >= venue.total_capacity) {
            return res.status(400).json({ message: 'Venue is fully booked for the selected time slot' });
        }

        // Add the booking to the venue
        venue.bookings.push({
            userId,
            date: bookDate,
            startTime,
            endTime
        });

        // Save the updated venue
        await venue.save();

        // Send confirmation email to the user and venue owner (you need to implement this)

        res.status(200).json({ message: 'Venue booked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
module.exports = router;

