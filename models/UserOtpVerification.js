const mongoose = require('mongoose');

const userOtpSchema = new mongoose.Schema({
    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
});

const userOtpVerification = mongoose.model(
    "userOtpVerification",
    userOtpSchema
)

module.exports = userOtpVerification;