const db = require('../db');

exports.getVenueList = (req, res) => {
    console.log(req.body)
    db.query('SELECT * FROM eventmate.venue', async (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send("Internal Server Error");
        }
        else {
            return res.status(200).json(results);
        }
    });
};