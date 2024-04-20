//main things of proj
const express = require("express");
const cors = require('cors'); 
// const db = require('./db')
const cookieParser = require("cookie-parser");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to Mongodb database');})
.catch((error)=>{
    console.log(error)
})

// db.connect((err) => {
//     if (err) {
//       console.error('Error connecting to MySQL:', err);
//       throw err;
//     }
//     console.log('Connected to MySQL database');
// });

// change this according to the request you make for form parsing use: 
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

//define routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
app.use('/venue-list', require('./routes/pages'));
app.use('/inviteFriend', require('./routes/pages'));
app.use('/profile', require('./routes/pages'));
app.use('/venue', require('./routes/pages'));
app.use('/player', require('./routes/pages'));
app.use('/add-activity', require('./routes/pages'));
app.use('/register-for-activity', require('./routes/pages'));
app.use('/book-venue', require('./routes/pages'));
app.post('/request-password-reset', require('./routes/auth'));
app.post('/reset-password',require('./routes/auth'));
app.use('/venue-review', require('./routes/pages'));
app.use('/venue-details', require('./routes/pages'));
app.use('/reservation-details', require('./routes/pages'));
app.use('/user-reservation-details', require('./routes/pages'));


app.listen(3001, ()=>{
    console.log("server started");
});


