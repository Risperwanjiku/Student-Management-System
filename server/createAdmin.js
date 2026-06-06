require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function createAdmin() {
  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.log('Usage: node createAdmin.js <username> <password>');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    await db.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hash]
    );
    console.log(`Admin created. Username: ${username}`);
  } catch (err) {
    console.error('Could not create admin:', err.message);
  }
  process.exit();
}

createAdmin();