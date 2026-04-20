
// import mysql from "mysql2/promise"; 
// import dotenv from "dotenv";

// dotenv.config(); 

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// export default pool; 



"use strict";

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 50,
  dateStrings: ["DATE", "DATETIME"],
});

export default pool;


export async function do_ma_query(query, params = []) {
  try {
    const [rows] = await pool.query(query, params);
    return rows;
  } catch (err) {
    throw err;
  }
}

