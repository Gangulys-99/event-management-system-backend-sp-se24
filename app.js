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
    console.log('Connected to Mongodb database');
  })
  .catch((error) => {
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
// app.post('/request-password-reset', require('./routes/auth'));
// app.post('/reset-password',require('./routes/auth'));
app.use('/venue-review', require('./routes/pages'));
app.use('/venue-details', require('./routes/pages'));
app.use('/reservation-details', require('./routes/pages'));
app.use('/user-reservation-details', require('./routes/pages'));

const PasswordResetToken = require('./models/PasswordResetToken');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require("util");
const UserOTPVerification = require("./models/UserOtpVerification")
const nodemailer = require('nodemailer');

app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.RESET_PASSWORD_SECRET, { expiresIn: '24h' });
    const resetToken = new PasswordResetToken({ userId: user._id, token });
    await resetToken.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ENV_MAIL_USER,
        pass: process.env.ENV_MAIL_PASS
      }
    });
    const mailOptions = {
      from: process.env.ENV_MAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `Click the following link to reset your password: http://localhost:3001/reset-password/${token}`
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

});



// Route to handle the reset token
app.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const resetToken = await PasswordResetToken.findOne({ token });
    if (resetToken) {
      res.send('<form method="post" action="/reset-password"><input type="password" name="password" required><input type="submit" value="Reset Password"></form>');
    } else {
      res.status(404).send('Invalid or expired token');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
            return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/reset-password', async (req, res) => {
  
  try {
    const { token, password } = req.body;

    const resetToken = await PasswordResetToken.findOne({ token });
    console.log('api body token: ', token);
    console.log(resetToken);
    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const decodedToken = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateOne({ _id: decodedToken.userId }, { password: hashedPassword });

    await PasswordResetToken.deleteOne({ token });

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(3001, () => {
  console.log("server started");
});
