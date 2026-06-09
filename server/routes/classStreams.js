const express = require('express');
const router = express.Router();
const db = require('../db');

// get all class streams with the number of students in each
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT class_streams.id, class_streams.name, class_streams.created_at,
             COUNT(students.id) AS student_count
      FROM class_streams
      LEFT JOIN students ON students.class_stream_id = class_streams.id
      GROUP BY class_streams.id
      ORDER BY class_streams.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch class streams' });
  }
});

// get a single class stream
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM class_streams WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Class stream not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch class stream' });
  }
});

// create a class stream
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const [result] = await db.query('INSERT INTO class_streams (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create class stream' });
  }
});

// update a class stream
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    await db.query('UPDATE class_streams SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ message: 'Class stream updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update class stream' });
  }
});

// delete a class stream
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM class_streams WHERE id = ?', [req.params.id]);
    res.json({ message: 'Class stream deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete class stream' });
  }
});

module.exports = router;