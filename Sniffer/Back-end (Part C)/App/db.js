import sql2 from "mysql2";
import dbConfig from "./db.config.js";

// creating a connection to database
const connection = sql2.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

// opening the MySQL connection
connection.connect((err) => {
    if (err) throw err;
    console.log("Successfully connected to the database.");
});

export default connection;