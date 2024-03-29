// const db = require('../db');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const { promisify } = require("util");

// exports.register = (req, res) => {
//     console.log(req.body)
//     const email = req.body.email;
//     const username = req.body.username;
//     const password = req.body.password;
//     const confPassword = req.body.confirmPassword;
//     const role = req.body.role;

//     db.query('SELECT email FROM eventmate.user WHERE email = ?', [email], async (error, results)=>{
//         if (error) {
//             console.log(error);
//             return res.status(500).send("Internal Server Error");
//         }

//         if (results.length > 0) {
//             console.log("User exists ", email);
//             return res.status(400).send("User exists");
//         } else if (password !== confPassword) {
//             console.log("Passwords do not match");
//             return res.status(400).send("Passwords do not match");
//         }

//         let hashedPassword = await bcrypt.hash(password, 8);
//         console.log(hashedPassword)

//         db.query('INSERT INTO eventmate.user(username, email, password_hash, role) VALUES (?, ?, ?, ?)',[username, email, hashedPassword, role],
//         (error, results)=>{
//             if(error){
//                 console.log(error);
//             }else{
//                 console.log("User registered");
//                 return res.status(200).send("User registered");
//             }
//         })
//     });
// };



// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return res.status(400).send("Enter email and password");           
//         }
//         db.query('SELECT * FROM eventmate.user WHERE email = ?', [email], async (err, results) => {
//             console.log(results);
//             if (!results || !await bcrypt.compare(password, results[0].password_hash)) {
//                 return res.status(400).send("Passwords do not match");
//             } else {
//                 const id = results[0].user_id; // Update to use the correct field

//                 const token = jwt.sign({ id }, process.env.ENV_JWT_SECRET, {
//                     expiresIn: process.env.ENV_JWT_EXPIRES_IN
//                 });

//                 console.log("the token is " + token);

//                 const cookieOptions = {
//                     expires: new Date(
//                         Date.now() + process.env.ENV_JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
//                     ),
//                     httpOnly: true
//                 }
//                 console.log("logged in");
//                 res.cookie('userSave', token, cookieOptions);
//                 res.status(200).redirect("/");
//             }
//         })
//     } catch (err) {
//         console.log(err);
//     }
// }

// exports.isLoggedIn = async (req, res, next) => {
//     if (req.cookies.userSave) {
//         try {
//             // 1. Verify the token
//             const decoded = await promisify(jwt.verify)(req.cookies.userSave,
//                 process.env.ENV_JWT_SECRET
//             );
//             console.log(decoded);

//             // 2. Check if the user still exist
//             db.query('SELECT * FROM eventmate.user WHERE user_id = ?', [decoded.id], (err, results) => {
//                 console.log(results);
//                 if (!results) {
//                     return next();
//                 }
//                 req.user = results[0];
//                 return next();
//             });
//         } catch (err) {
//             console.log(err)
//             return next();
//         }
//     } else {
//         next();
//     }
// }

// exports.logout = (req, res) => {
//     res.cookie('userSave', 'logout', {
//         expires: new Date(Date.now() + 2 * 1000),
//         httpOnly: true
//     });
//     res.status(200).redirect("/");
// }

const User = require('../models/User'); // Import the user model
require('dotenv').config()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require("util");

exports.register = async (req, res) => {
    try {
        const { email, username, password, confirmPassword, role } = req.body;

        // Check if user with the provided email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User exists ", email);
            return res.status(400).send("User exists");
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            console.log("Passwords do not match");
            return res.status(400).send("Passwords do not match");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Create a new user document
        await User.create({ username, email, password: hashedPassword, role });

        console.log("User registered");
        return res.status(200).send("User registered");
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).send("Invalid email or password");
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.ENV_JWT_SECRET, {
            expiresIn: process.env.ENV_JWT_EXPIRES_IN
        });

        console.log("the token is " + token);

        // Set cookie with JWT token
        res.cookie('userSave', token, {
            expires: new Date(Date.now() + process.env.ENV_JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            httpOnly: true
        });

        console.log("logged in");
        return res.status(200).redirect("/");
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
};

exports.isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.userSave) {
            // 1. Verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.userSave, process.env.ENV_JWT_SECRET);

            // 2. Check if the user exists in the database
            const user = await User.findById(decoded.id);
            if (!user) {
                return next();
            }

            req.user = user;
            return next();
        } else {
            return next();
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
};

exports.logout = (req, res) => {
    res.clearCookie('userSave');
    res.status(200).redirect("/");
};
