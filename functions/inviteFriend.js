const nodemailer = require('nodemailer');

require('dotenv').config()

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.ENV_MAIL_USER, 
      pass: process.env.ENV_MAIL_PASS, 
    },
});

async function inviteFriend(name, friendEmail){
    try{
        console.log("invite friend");
        const websiteUrl = 'https://www.google.com/'
        const mailOptions = {
            from: process.env.ENV_MAIL_USER, 
            to: friendEmail, 
            subject: `Your Friend ${name} has invited to EventMate!`,
            html: `
              <p>You can book your venues for sports and register for exciting activites here.</p>
              <p>Please click the link below to visit our page:</p>
              <a href="${websiteUrl}">EventMate</a>
              <p>See you there!</p>
            `,
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending invite to friend', error);
        } else {
            console.log('successfully sent invite to your friend', info.response);
        }
        });
        
    }catch(error){
        console.log(error)
    }
}



module.exports = inviteFriend;