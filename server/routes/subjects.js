const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subjects ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });
    const [result] = await db.query('INSERT INTO subjects (name, code) VALUES (?, ?)', [name, code]);
    res.status(201).json({ id: result.insertId, name, code });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });
    await db.query('UPDATE subjects SET name = ?, code = ? WHERE id = ?', [name, code, req.params.id]);
    res.json({ message: 'Subject updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

module.exports = router;