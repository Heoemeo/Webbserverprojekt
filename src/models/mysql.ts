import mysql from "mysql2/promise"
//this is uesed to send sql queries from backend
export const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password:"",
    database: "habit_tracker",
})
