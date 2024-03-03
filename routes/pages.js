const express = require("express");
const authController = require("../controllers/auth");
const venueController = require("../controllers/venues");
const router = express.Router();

router.get('/',authController.isLoggedIn, (req, res) => {
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

router.get('/venue-list', (req, res) => {
    venueController.getVenueList(req, res);
})
module.exports = router;

