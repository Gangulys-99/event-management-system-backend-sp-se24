// const express = require('express');
// const session = require('express-session');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const db = require('./db');

// // require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(session({ secret: process.env.ENV_SESSION_KEY, resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });

// passport.use(new GoogleStrategy({
//   clientID: process.env.ENV_GOOGLE_CLIENT_ID,
//   clientSecret: process.env.ENV_GOOGLE_CLIENT_SECRET,
//   callbackURL: 'http://localhost:3000/auth/google/callback'
// },
//   async (accessToken, refreshToken, profile, done) => {
//     // Handle user registration/login here
//     try {
//       // Example: Check if the user is already in the database
//       const [existingUser] = await db.query('SELECT * FROM eventmate.users WHERE google_id = ?', [profile.id]);

//       if (existingUser.length > 0) {
//         // User already exists, return the user data
//         return done(null, existingUser[0]);
//       }

//       // User does not exist, register the user in the database
//       const [newUser] = await db.query('INSERT INTO eventmate.users (google_id, username, email) VALUES (?, ?, ?)',
//         [profile.id, profile.displayName, profile.emails[0].value]);

//       return done(null, newUser);
//     } catch (error) {
//       console.error('Error during Google authentication:', error);
//       return done(error, null);
//     }
//   }
// ));

// // Routes
// app.get('/', (req, res) => {
//   res.send('Hello, this is the home page!');
// });

// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req, res) => {
//     // Successful authentication, redirect to the home page or handle as needed
//     res.redirect('/');
//   });

// app.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });


const path = require('path');
const express = require("express");
const session = require('express-session');
var passport = require('passport');
const router = express.Router();
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
var app = express();
app.use(cors());

require('dotenv').config()
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

app.use(session({
  secret: process.env.ENV_SESSION_KEY, 
  resave: false,
  saveUninitialized: true
}));

// app.use(
//     express.static(path.resolve(__dirname, '../venuemanagement/build')));

// app.get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, '../venuemanagement/build', 'index.html'));
//     });

app.get('*', (req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

const {registerUser, loginUser} = require('./functions/authenticationFuncs')
const authenticate = require('./middleware/middleware');
// const {generatePasswordResetToken, sendPasswordResetEmail, resetPassword} = require('./functions/passwordReset');
// const {mailToCustomer} = require('./functions/mailToCustomer');
// const {mailToOwner} = require('./functions/mailToOwner');
// const createVenue = require('./functions/createVenue');
// const createGroupChat = require('./functions/createGroupChat');
// const changeCapacity = require('./functions/openCloseVenue');
const {twoFactoredMail, verifyTwoFactored} = require('./functions/twofactorAuth');
// const {inviteFriend} = require('./functions/inviteFriends');
// const {cancelNotification, openedNotification} = require('./functions/cancelNotification');

// change this according to the request you make for form parsing use: 
// app.use(express.urlencoded({ extended: true }));

const {oauthTokenize} = require('./functions/authenticate');
app.use(express.json()); 
// app.use(passport.initialize())
// app.use(passport.session());
// app.get('/google', passport.authenticate('google',{scope:['profile', 'email'], successRedirect: '/'}));
// app.get('/oauth/google',passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/'}), async (req,res)=>{
//   email = req.user._json.email;
//   const {token,user} = await oauthTokenize({email});
//   res.header('Authorization', `Bearer ${token}`);
//   res.status(200).json({user:user, token: token});
// });
app.post('/api/oauth', async (req, res) => {
  try {
    const email = req.body.email;
    const {token,user} = await oauthTokenize({email});
    res.header('Authorization', `Bearer ${token}`);
    res.status(200).json({user:user, authorization: token});
  } catch (error) {
    console.error('Oauth error:', error);
    res.status(500).json({ error: 'Oauth failed' });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const updatedUser = req.body;
    
    if (!updatedUser || !updatedUser.username || !updatedUser.email || !updatedUser.role) {
      res.status(400).json({ error: 'Invalid data' });
      return;
    }
  
    await db.promise().query(
      'UPDATE eventmate.User SET username = ?, email = ?,  role = ? WHERE user_id = ?',
      [updatedUser.username, updatedUser.email, updatedUser.role, updatedUser.userid]
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating User:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// (req, res) => {
//     email = req.user._json.email;
//     const {token,user} = oauthTokenize({email});
//     res.header('Authorization', `Bearer ${token}`);
//     res.status(200).json({user:user, token: token});
//     return res.redirect('/');
  // })
// }
// app.get('/oauth/google',passport.authenticate('google', { failureRedirect: '/login'}), async (req,res)=>{
//   email = req.user._json.email;
//   const {token,user} = await oauthTokenize({email});
//   res.header('Authorization', `Bearer ${token}`);
//   res.status(200).json({user:user, token: token});
// });
const db = require('./db')

db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      throw err;
    }
    console.log('Connected to MySQL database');
});


const usersRoutes = require('./routes/routes');

/*
app.get('/', (req,res) => {
    res.json({message:"You are at home page!"});
});*/

app.use('/api/user', authenticate, usersRoutes);

// Registration route
app.post('/api/register', async (req, res) => {
    
    try {
      const { username, email, password, role } = req.body;
      const {token, registeredUser} = await registerUser({ username, email, password, role });
    //   console.log(token)
    //   console.log(registeredUser)
      res.header('Authorization', `Bearer ${token}`);
      res.status(201).json({user: registeredUser, msg: "Registration Successful"});

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });

    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      const {token, user} = await loginUser({ username, password });
  
      if (token) {
        if(user.two_factor_enabled===1){
           email = user.email; 
           console.log(email);
           await twoFactoredMail({email})
        }
        const [result] = await db.promise().query('SELECT * FROM eventmate.User WHERE username = ? ',[user.username]);
        res.set('Authorization', `Bearer ${token}`);
        res.status(200).json({user:result[0], authorization:token});

      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
});