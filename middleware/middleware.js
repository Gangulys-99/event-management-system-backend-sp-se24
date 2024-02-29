const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config()


function authenticate(req, res, next) {
  
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.ENV_SECRET_KEY, async (err, decoded) => {
    if (err) {
      console.log(err.name);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const [rex] = await db.promise().query('SELECT * FROM eventmate.User where username = ?',[decoded.username]);
    if(rex[0].two_factor_enabled==1 && rex[0].two_factor_secret !='1'){
      return res.status(400).json({message:'Unauthorized: complete Two factored authentication after login'})
    }
    req.user = rex[0];
    res.header('Authorization', `Bearer ${token}`);
    next();
  });
}

module.exports = authenticate;
