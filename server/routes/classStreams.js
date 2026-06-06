const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cs.id, cs.name, cs.created_at, COUNT(s.id) AS student_count
       FROM class_streams cs
       LEFT JOIN students s ON s.class_stream_id = cs.id
       GROUP BY cs.id, cs.name, cs.created_at
       ORDER BY cs.name`
    );
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch class streams:', err);
    res.status(500).json({ error: 'Failed to fetch class streams' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Stream name is required' });
    const [result] = await db.query('INSERT INTO class_streams (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create class stream' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Stream name is required' });
    await db.query('UPDATE class_streams SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ id: req.params.id, name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update class stream' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM class_streams WHERE id = ?', [req.params.id]);
    res.json({ message: 'Class stream deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete class stream' });
  }
});

// get the subjects assigned to a stream
router.get('/:id/subjects', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.name
       FROM subjects s
       JOIN subject_streams ss ON ss.subject_id = s.id
       WHERE ss.class_stream_id = ?
       ORDER BY s.name`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch stream subjects:', err);
    res.status(500).json({ error: 'Failed to fetch stream subjects' });
  }
});

module.exports = router;