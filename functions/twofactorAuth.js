const db = require('../db');
const nodemailer = require('nodemailer');

require('dotenv').config()

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.ENV_MAIL_USER, 
      pass: process.env.ENV_MAIL_PASS, 
    },
});

async function twoFactoredMail({email}){
    try{
        const [result] = await db.promise().query('SELECT * FROM eventmate.User WHERE email = ? ',[email]);
        if(result.length == 0){
           throw new Error("No user Found with this email");
        }
        const temp = Math.floor(100000 + Math.random() * 900000);
        const twoFactorOtp = temp.toString();
        await db.promise().query('update eventmate.User SET two_factor_secret = ? where user_id = ?',[twoFactorOtp, result[0].user_id]);
        const mailOptions = {
            from: process.env.ENV_MAIL_USER, 
            to: email, 
            subject: 'Two factored Otp Request',
            html: `
              <p>You have requested to receive Two factored Otp.</p>
              <p>Enter the following OTP to authenticate:</p>
              <p>${twoFactorOtp}</p>
              <p>If you didn't request a Two factored Otp, please ignore this email.</p>
            `,
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending Two factored Otp:', error);
        } else {
            console.log('Two factored OTP sent here:', info.response);
        }
        });
        
    }catch(error){
        console.log(error)
    }
}


async function verifyTwoFactored({Otp, email}){
    try{
       const [rex] = await db.promise().query('SELECT * FROM eventmate.User where email = ?',[email]);
       if(rex.length == 0){
         throw new Error('No User Found') 
       }
       if(rex[0].two_factor_secret === Otp){
        await db.promise().query('update eventmate.User SET two_factor_secret = ? where email = ?',['1',email]);
        return 1
       }else{
        return null
       }
       
    }catch(error){
        return null
    }
}
module.exports = {
    twoFactoredMail,
    verifyTwoFactored,
};