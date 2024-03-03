require('dotenv').config()
const mysql = require('mysql2');

module.exports = mysql.createConnection({
    host: process.env.ENV_DB_HOST,
    user: process.env.ENV_DB_USER,
    password: process.env.ENV_DB_PASSWORD,
    database: process.env.ENV_DB_NAME,
    connectTimeout: 300000
})