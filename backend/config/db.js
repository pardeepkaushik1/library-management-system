
// const mysql = require("mysql2");

// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// });

// db.connect((err) => {
//     if (err) {
//         console.log("Database connection failed:", err);
//     } else {
//         console.log("MySQL Database Connected Successfully!");
//     }
// });

// module.exports = db;



const mysql = require("mysql2");
const fs = require("fs");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: fs.readFileSync(process.env.DB_SSL_CA)
    }
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("TiDB Cloud Database Connected Successfully!");
    }
});

module.exports = db;
