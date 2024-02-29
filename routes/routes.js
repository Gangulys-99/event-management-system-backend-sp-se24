const express = require('express');
const router = express.Router();

const db = require('../db');

// // api to get users
// router.get('/',async (req,res) =>{

//     try {
//         const [results] = await db.promise().query('SELECT * FROM ignite.User');
//         res.json(results);
//     } catch (error) {
//         console.error('Error querying users:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
    
// });

// api to get specific user
router.get('/profile', async (req, res) => {
    try {
      const [results] = await db.promise().query('SELECT * FROM eventmate.User WHERE username = ?', [req.user.username]);
  
      if (results.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.status(200).json(results[0]);
      }
    } catch (error) {
      console.error('Error querying User:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});



// api to add users
// router.post('/', async (req, res) => {
//     try {
//       const newUser = req.body;
//       if (!newUser || !newUser.username || !newUser.email || !newUser.password || !newUser.role) {
//         res.status(400).json({ error: 'Invalid data' });
//         return;
//       }
  
//       const [result] = await db.promise().query('INSERT INTO ignite.User (username, email, password_hash, role) VALUES (?, ?, ?, ?)', [
//         newUser.username,
//         newUser.email,
//         newUser.password,
//         newUser.role
//       ]);
  
//       newUser.id = result.insertId;
//       res.status(201).json(newUser);
//     } catch (error) {
//       console.error('Error inserting item:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// api to update user
router.put('/profile', async (req, res) => {
    try {
      const updatedUser = req.body;
      
      if (!updatedUser || !updatedUser.username || !updatedUser.email || !updatedUser.role) {
        res.status(400).json({ error: 'Invalid data' });
        return;
      }
    
      await db.promise().query(
        'UPDATE eventmate.User SET username = ?, email = ?,  role = ? WHERE user_id = ?',
        [updatedUser.username, updatedUser.email, updatedUser.role, req.user.userid]
      );
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating User:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});
  

// api to delete user
// router.delete('/:id', async (req, res) => {
//     try {
//       const userId = parseInt(req.params.id);
  
//       const [result] = await db.promise().query('DELETE FROM ignite.User WHERE user_id = ?', [userId]);
  
//       if (result.affectedRows === 0) {
//         res.status(404).json({ error: 'User not found' });
//       } else {
//         res.json({ message: 'User deleted successfully' });
//       }
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
// });


module.exports = router;