const mysql = require('mysql2');
const dbConnection = mysql.createConnection({
 host: 'localhost',
 user: 'root',
 database: 'shatrov_login',
 password: 'Admin_Develop'
});
module.exports = dbConnection.promise();
