const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.name, s.code,
        GROUP_CONCAT(cs.name ORDER BY cs.name SEPARATOR ',') AS streams
       FROM subjects s
       LEFT JOIN subject_streams ss ON ss.subject_id = s.id
       LEFT JOIN class_streams cs ON cs.id = ss.class_stream_id
       GROUP BY s.id, s.name, s.code
       ORDER BY s.id`
    );
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

// get the stream ids a subject is assigned to
router.get('/:id/streams', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT class_stream_id FROM subject_streams WHERE subject_id = ?',
      [req.params.id]
    );
    res.json(rows.map((r) => r.class_stream_id));
  } catch (err) {
    console.error('Failed to fetch subject streams:', err);
    res.status(500).json({ error: 'Failed to fetch subject streams' });
  }
});

// replace a subject's stream assignments
router.put('/:id/streams', async (req, res) => {
  const subjectId = req.params.id;
  const { stream_ids } = req.body;
  try {
    await db.query('DELETE FROM subject_streams WHERE subject_id = ?', [subjectId]);
    for (const streamId of stream_ids) {
      await db.query(
        'INSERT INTO subject_streams (subject_id, class_stream_id) VALUES (?, ?)',
        [subjectId, streamId]
      );
    }
    res.json({ message: 'Subject assignments updated' });
  } catch (err) {
    console.error('Failed to update subject streams:', err);
    res.status(500).json({ error: 'Failed to update subject streams' });
  }
});

module.exports = router;