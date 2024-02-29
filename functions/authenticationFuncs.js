const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
// const { registerChatUser } = require('./registerChatUser');

require('dotenv').config()

// Function for user registration
async function registerUser({ username, email, password, role }) {
  
    try {
    
    const [existingUser] = await db.promise().query('SELECT * FROM eventmate.User WHERE username = ? OR email = ?', [username, email]);

    if (existingUser.length > 0){
        throw new Error('Username or email already exists');
    }else if (!username || !email || !password || !role) {
        throw new Error('Registration details cannot be null');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.promise().query('INSERT INTO eventmate.User (username, email, password_hash, role) VALUES ( ?, ?, ?, ?)', [ username, email, hashedPassword, role]);

    const [newUser] = await db.promise().query('SELECT * FROM eventmate.User WHERE user_id = ?', [result.insertId]);

    // console.log(newUser)
    
    const token = jwt.sign({ userId: newUser[0].id, username: newUser[0].username }, process.env.ENV_SECRET_KEY, { expiresIn: '15m' });
    // console.log(token)

    const [res] = await db.promise().query('INSERT INTO eventmate.Tokens (userId, tokenId) VALUES ( ?, ?)',[newUser[0].user_id, token]);

    // await registerChatUser({ userid: newUser[0].id, username: newUser[0].username , email:email, role:role});
    // return { token, registeredUser: newUser[0] };
    
  } catch (error) {

    console.log(error)

  }
}

// Function for user login
async function loginUser({ username, password }) {
  try {
    const [users] = await db.promise().query('SELECT * FROM eventmate.User WHERE username = ?', [username]);

    if (users.length === 0) {
      throw new Error('User not found');
    }
    if (!username || !password) {
        throw new Error('Username or Password cannot be null');
    }


    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign({ userId: user.user_id, username: user.username }, process.env.ENV_SECRET_KEY, { expiresIn: '15m' });

    const [res] = await db.promise().query('SELECT * FROM eventmate.Tokens WHERE userId = ?',[user.user_id]);

    if (res.length == 0){
        await db.promise().query('INSERT INTO eventmate.Tokens (userId, tokenId) VALUES ( ?, ?)',[user.user_id,token]);
    }else{
        await db.promise().query('UPDATE eventmate.Tokens SET tokenId = ? WHERE userId = ?',[token, user.user_id]);
    }

    return {token, user};

  } catch (error) {

    console.log(error)

  }
}


module.exports = {
  registerUser,
  loginUser,
};
