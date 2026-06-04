const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM class_streams');
    res.json(rows);
  } catch (err) {
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

module.exports = router;