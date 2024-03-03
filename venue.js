const express = require("express");
const db = require('./db');
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post('/api/venueList', async (req, res) => {
    try {
        const { userId } = req.body;
        const [results] = await db.execute('SELECT * FROM eventmate.venue WHERE venue_name = ?', [venue_name]);

        res.status(200).json(results);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
