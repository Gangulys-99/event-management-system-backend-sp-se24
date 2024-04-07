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

router.get('/profile', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.send("profile")

    } else {
        res.send("login")
    }
})

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

})


module.exports = router;

