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
const UserOTPVerification = require("../models/UserOtpVerification")
const nodemailer = require('nodemailer');

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
        const verified = false;
        // Create a new user document
        await User.create({ username, email, password: hashedPassword, role, verified});

        console.log("User registered");
        return res.status(200).send("User registered");
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
};

// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Find user by email
//         const user = await User.findOne({ email });

//         if (!user || !await bcrypt.compare(password, user.password)) {
//             return res.status(400).send("Invalid email or password");
//         }

//         // Generate JWT token
//         const token = jwt.sign({ id: user._id }, process.env.ENV_JWT_SECRET, {
//             expiresIn: process.env.ENV_JWT_EXPIRES_IN
//         });

//         console.log("the token is " + token);

//         // Set cookie with JWT token
//         res.cookie('userSave', token, {
//             expires: new Date(Date.now() + 86400 * 1000),
//             httpOnly: true
//         });

//         console.log("logged in");
//         return res.status(200).redirect("/");
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send("Internal Server Error");
//     }
// };

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).send("Invalid email or password");
        }

        // Send OTP verification email
        await sendOtpVerificationEmail(user, res);

    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
};

exports.verify = async(req, res) => {
    try {
        let {userId, otp} = req.body;
        if(!userId || !otp){
            throw Error("empty otp");
        } else{
            const userOtpVerificationRecord = await UserOTPVerification.find({
                userId
            });
            if(userOtpVerificationRecord.length <=0){
                throw new Error("accound invalid or already verified")
            } else{
                const expiresAt = userOtpVerificationRecord[0];
                const hashedOtp = userOtpVerificationRecord[0].otp;
                if(expiresAt < Date.now){
                    await userOtpVerification.deletemany({userId});
                    throw new Error("code expired");
                }else{
                    const validOtp = bcrypt.compare(otp, hashedOtp);
                    if(!validOtp){
                        throw new Error("invalid otp");
                    }else{ 
                        await User.updateOne({_id: userId}, {verified:true});
                        UserOTPVerification.deleteMany({ userId});
                        res.json({
                            status:"verified",
                            message: "success "
                        });
                    }
                }
            }
        }
    } catch (error) {
        res.json({
            status:"falied",
            message: error.message
        });
    }
};


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ENV_MAIL_USER,
        pass: process.env.ENV_MAIL_PASS,
    },
});

const sendOtpVerificationEmail = async ({_id, email}, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random()*9000)}`;
        const mailOptions = {
            from: process.env.ENV_MAIL_USER,
            to: email,
            subject: 'Two-factor OTP Request',
            html: `
              <p>You have requested to receive a two-factor OTP.</p>
              <p>Enter the following OTP to authenticate:</p>
              <p>${otp}</p>
              <p>If you didn't request a two-factor OTP, please ignore this email.</p>
            `,
        };

        const saltRounds = 10 ;
        const hashedOtp = await bcrypt.hash(otp, saltRounds);

        const newOtpVerification = await new UserOTPVerification({
            userId:_id,
            otp:hashedOtp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000
        });

        await newOtpVerification.save();
        await transporter.sendMail(mailOptions);
        res.json({
            status : "pending",
            msg : "mail sent",
            data : {
                userId : _id,
                email
            }
        });
    } catch (error) {
        res.json({
            status : "failed",
            msg :  error.message,
            
        })
    }
}

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



//Password reset request feature

const crypto = require('crypto');

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).send({ message: "User not found" });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    // Log the token and its expiry time
    console.log(`Generated Token: ${token}`);
    console.log(`Token Expires At: ${new Date(user.resetPasswordExpires)}`);

    await user.save();

    const resetEmail = {
        to: user.email,
        from: process.env.ENV_MAIL_USER,
        subject: 'Password Reset Request',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
        http://localhost:3000/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(resetEmail, function(err, info) {
        if (err) {
            console.error('Error sending mail:', err);
            return res.status(500).send({ message: 'Error sending reset email', error: err.toString() });
        }
        res.send({ message: 'Reset link sent to your email account' });
    });
};

//Password reset feature

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    // Find user with a valid token and check if the token has not expired
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() } // Checks that the current time is less than the expiration time
    });

    // Log the token validation attempt
    console.log(`Validating Token: ${token}`);
    console.log(`Current Time: ${new Date()}`);

    if (!user) {
        console.log('Token is invalid or has expired.');
        return res.status(400).send({ message: "Password reset token is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt); // Update the user's password
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpires = undefined; // Clear the expiration time
    await user.save();

    res.send({ message: 'Password has been updated' });
};

const axios = require('axios');
exports.verify_captcha =  async (req, res) => {
    const userCaptchaResponse = req.body.captchaResponse;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, {}, {
          params: {
            secret: secretKey,
            response: userCaptchaResponse
          }
        });

        const verificationResult = response.data;

        if (verificationResult.success) {
          res.send({ success: true, message: 'CAPTCHA verified successfully!' });
        } else {
          res.send({ success: false, message: 'Failed to verify CAPTCHA.' });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'Error in verifying CAPTCHA.', error: error.message  });
    }
};




