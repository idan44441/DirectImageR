const mysql = require("mysql2");

// Create a pool
const pool = mysql.createPool({
    host: 'mysql-684beed-idano44441-ca01.i.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_mdlXtfJKEYKr_1b3JTK',
    database: 'IdanDb',
    connectionLimit: 10000,
    port: 19909
});

// Get connection from the pool
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database: ', err);
        return;
    }

    console.log('Connected - to database');

    // Use the connection for querying

    // Example query
    connection.query('SELECT * FROM users', (error, results, fields) => {
        if (error) {
            console.error('Error executing query: ', error);
            connection.release(); // Release the connection back to the pool
            return;
        }
        else 
    {
        console.log(results); 
    }

        // Do something with the results

        // Release the connection back to the pool
        connection.release();
    });
});

// Export the pool
module.exports = pool;
