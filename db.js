require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.ENV_DB_HOST,
    user: process.env.ENV_DB_USER,
    password: process.env.ENV_DB_PASSWORD,
    database: process.env.ENV_DB_NAME,
    connectTimeout: 300000
});

module.exports = pool;
