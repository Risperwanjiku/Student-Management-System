require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Student Management System API is running' });
});

// get all class streams
app.get('/api/class-streams', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM class_streams');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch class streams' });
  }
});

// add a new class stream
app.post('/api/class-streams', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Stream name is required' });
    }
    const [result] = await db.query(
      'INSERT INTO class_streams (name) VALUES (?)',
      [name]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create class stream' });
  }
});

// update a class stream
app.put('/api/class-streams/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Stream name is required' });
    }
    await db.query('UPDATE class_streams SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ id: req.params.id, name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update class stream' });
  }
});

// delete a class stream
app.delete('/api/class-streams/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM class_streams WHERE id = ?', [req.params.id]);
    res.json({ message: 'Class stream deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete class stream' });
  }
});

// quick check that the database connection works
db.query('SELECT 1')
  .then(() => console.log('Connected to MySQL database'))
  .catch((err) => console.error('Database connection failed:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});