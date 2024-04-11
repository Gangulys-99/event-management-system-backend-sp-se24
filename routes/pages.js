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
router.get('/profile', async (req, res) => {
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

router.put('/profile', async (req, res) => {
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

            const updatedUserData = await findUserByEmail(email); // Replace with your logic

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

module.exports = router;

