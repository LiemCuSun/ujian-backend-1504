// NOTE setup mysql
let mysql = require('mysql') // NOTE untuk menyambungkan api dengan mysql database

let DB_HOST ="localhost"
let DB_PORT ="3306"
let DB_USER ="liemcusun"
let DB_PASSWORD ="liemcusun"
let DB_NAME ="backend_2021"
let TOKEN_KEY = "!@#$%^&*"
let CRYPTO_KEY = "!@#$%^&*"

let connection = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});

module.exports = connection