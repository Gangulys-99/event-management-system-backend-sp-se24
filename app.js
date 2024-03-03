//main things of proj
const express = require("express");
const db = require('./db')
const cookieParser = require("cookie-parser");


const app = express();
app.use(express.json());
app.use(cookieParser());


db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      throw err;
    }
    console.log('Connected to MySQL database');
});

// change this according to the request you make for form parsing use: 
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

//define routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));


app.listen(5000, ()=>{
    console.log("server started");
});


