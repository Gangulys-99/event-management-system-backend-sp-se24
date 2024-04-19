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

router.put('/profile', authController.isLoggedIn, async (req, res) => {
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
        res.status(400).json({ error });
    }

});

// open or close

router.put('/venue/:id', authController.isLoggedIn, async (req, res) => {
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


        await createActivity(userId, activity_name, venue_id, total_capacity, address, date, start_time, end_time);
        res.status(200).json({ message: 'Successfully added activity' });
    } catch (error) {
        console.log(error)
        res.status(400).json({ error });
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

        const user = await User.findById(userId);
        const userEmail = user.email;
        console.log(userEmail)
        const owner = await User.findById(venue.userId);
        if (!owner) {
            throw new Error('Venue owner not found');
        }

        const ownerEmail = owner.email;

        // Send confirmation email
        await sendConfirmationEmail(userEmail, ownerEmail, venue.v_name, bookDate, startTime, endTime);

        res.status(200).json({ message: 'Venue booked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
const nodemailer = require('nodemailer');

async function sendConfirmationEmail(userEmail, venueOwnerEmail, venueName, bookDate, startTime, endTime) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ENV_MAIL_USER,
                pass: process.env.ENV_MAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.ENV_MAIL_USER,
            to: userEmail,
            cc: venueOwnerEmail, // Send a copy to the venue owner
            subject: 'Venue Booking Confirmation',
            html: `
                <p>Dear User,</p>
                <p>Your booking at ${venueName} has been confirmed:</p>
                <p>Date: ${bookDate}</p>
                <p>Time: ${startTime} to ${endTime}</p>
                <p>Thank you for choosing ${venueName}.</p>
                <p>Best regards,</p>
                <p>Eventmate</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        throw new Error('Failed to send confirmation email');
    }
}

// venue review
router.post('/venue-review', authController.isLoggedIn, async (req, res) => {
    try {
        const { venueId, rating, review } = req.body;
        const userId = req.user._id;
        const bookedVenue = await User.findById(userId).populate('bookings');

        const hasBooking = bookedVenue.bookings.some(booking => booking.venueId.toString() === req.params.venueId);

        if (!hasBooking) {
            return res.status(400).json({ message: 'Booking not found for this venue' });
        }
        const newReview = {
            userId: req.user._id,
            rating: req.body.rating,
            review: req.body.review || '', // handle optional review field
        };

        const venue = await Venue.findByIdAndUpdate(
            req.params.venueId,
            { $push: { reviews: newReview } },
            { new: true } // return the updated document
        );

        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }

        res.status(200).json({ message: 'Review submitted successfully' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
});

// get details of a particular venue

router.get('/venue-details', async (req, res) => {
    try {
        const venueId = req.body.venueId;
        console.log(venueId);
        const venue = await Venue.findById(venueId);
        console.log(venue);
        res.status(200).json(venue);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// get all reservations at a venue
router.get('/reservation-details', async (req, res) => {
    try {
        const venueId = req.body.venueId;

        // Find the venue by ID
        const venue = await Venue.findById(venueId).populate({
            path: 'bookings.userId',
            select: 'username' // Select the username field to be populated
        });
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }

        
        // Return the bookings/reservations for the venue
        res.status(200).json({ bookings: venue.bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// reservations by user
router.get('/user-reservation-details', async (req, res) => {
    try {
        const userId = req.body.userId;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find all the reservations made by the user
        const reservations = await Venue.find({ 'bookings.userId': userId })
            .select('v_name address sport bookings');

        // Return the reservations made by the user
        res.status(200).json({ reservations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// venue bookmark
router.post('/bookmark-venue/', authController.isLoggedIn, async (req, res) => {
    try {
        const userId = req.body.userId;
        const venueId = req.params.venueId;

        // Check if the venue exists
        const venue = await Venue.findById(venueId);
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }

        // Check if the venue is already bookmarked by the user
        const isBookmarked = venue.bookmarks.some(bookmark => bookmark.userId.equals(userId));
        if (isBookmarked) {
            return res.status(400).json({ message: 'Venue already bookmarked' });
        }

        // Add the bookmark to the venue
        venue.bookmarks.push({ userId });
        venue.bookmarked = true;

        // Save the updated venue
        await venue.save();

        res.status(200).json({ message: 'Venue bookmarked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

