// run this once to load schema.sql into the aiven cloud database
// usage: node setup-db.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function setup() {
  // read the schema file from the project root (one level up from server)
  const sql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true, // so the whole .sql file can run in one go
    ssl: { rejectUnauthorized: false } // aiven needs ssl
  });

  console.log('loading schema...');
  await db.query(sql);
  console.log('done - tables and sample data created');
  await db.end();
}

setup().catch((err) => {
  console.log('error:', err.message);
  process.exit(1);
});