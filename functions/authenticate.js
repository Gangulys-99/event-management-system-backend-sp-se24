// // Import necessary modules
// const bcrypt = require('bcrypt');
// const db = require('../database');
// var passport = require('passport');
// var GoogleStrategy = require('passport-google-oauth20').Strategy;


// require('dotenv').config()

// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });

// passport.deserializeUser((user, done) => {
//     done(null, user);
// });

// passport.use(new GoogleStrategy({
//     clientID: process.env.ENV_CLIENT_ID_GOOGLE,
//     clientSecret: process.env.ENV_SECRET_KEY_GOOGLE,
//     callbackURL: process.env.ENV_CALLBACK_URL
//   },
//   async function(accessToken, refreshToken, profile, cb) {
//     // Register user here
//     try {
//       email = profile._json.email;
//       username = email.slice(0,-10);
//       password = profile.id;
//       role = "Attendee";

//       var [existingUser] = await db.promise().query('SELECT * FROM ignite.User WHERE username = ? OR email = ?', [username, email]);
  
//       if (existingUser.length == 0){
        
//         const hashedPassword = await bcrypt.hash(password, 10);
      
//         const [result] = await db.promise().query('INSERT INTO ignite.User (username, email, password_hash, role) VALUES ( ?, ?, ?, ?)', [ username, email, hashedPassword, role]);
    
//         const [newUser] = await db.promise().query('SELECT * FROM ignite.User WHERE user_id = ?', [result.insertId]);
        
//         existingUser = newUser;
//       }
      
//     } catch (error) {
  
//       console.log(error)
  
//     }
//     // console.log(accessToken);
//     // console.log(refreshToken);
//     // console.log(profile);
//     cb(null, profile);
//   }
// ));



const bcrypt = require('bcrypt');
const db = require('../db');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

require('dotenv').config()

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.ENV_GOOGLE_CLIENT_ID,
    clientSecret: process.env.ENV_GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  async function(accessToken, refreshToken, profile, cb) {
    // Register user here
    try {
      email = profile._json.email;
      username = email.slice(0,-10);
      password = profile.id;
      role = "Attendee";

      var [existingUser] = await db.promise().query('SELECT * FROM eventmate.User WHERE username = ? OR email = ?', [username, email]);
  
      if (existingUser.length == 0){
        
        const hashedPassword = await bcrypt.hash(password, 10);
      
        const [result] = await db.promise().query('INSERT INTO eventmate.User (username, email, password_hash, role) VALUES ( ?, ?, ?, ?)', [ username, email, hashedPassword, role]);
    
        const [newUser] = await db.promise().query('SELECT * FROM eventmate.User WHERE user_id = ?', [result.insertId]);
        
        existingUser = newUser;
      }
      
    } catch (error) {
  
      console.log(error)
  
    }
    // console.log(accessToken);
    // console.log(refreshToken);
    // console.log(profile);
    cb(null, profile);
  }
));

async function oauthTokenize({email}){
  var [existingUser] = await db.promise().query('SELECT * FROM eventmate.User WHERE email = ?', [email]);
  const token = jwt.sign({ userId: existingUser[0].id, username: existingUser[0].username }, process.env.ENV_SECRET_KEY, { expiresIn: '15m' });
  const [result] = await db.promise().query('SELECT * FROM eventmate.Tokens WHERE userId = ?',[existingUser[0].user_id]);
  if (result.length == 0){
      await db.promise().query('INSERT INTO eventmate.Tokens (userId, tokenId) VALUES ( ?, ?)',[existingUser[0].user_id,token]);
  }else{
      await db.promise().query('UPDATE eventmate.Tokens SET tokenId = ? WHERE userId = ?',[token, existingUser[0].user_id]);
  }
  if(existingUser[0].two_factor_enabled==1&&existingUser[0].two_factor_secret !='1'){
    await db.promise().query('UPDATE eventmate.User SET two_factor_secret = ? WHERE user_id = ?',['1', existingUser[0].user_id])
  }
  return {token,user:existingUser[0]};
}

module.exports = {
  oauthTokenize,
};