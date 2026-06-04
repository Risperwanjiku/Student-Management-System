const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT students.id, students.name, students.admission_no, students.gender,
             students.class_stream_id, class_streams.name AS stream_name
      FROM students
      LEFT JOIN class_streams ON students.class_stream_id = class_streams.id
      ORDER BY students.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, admission_no, gender, class_stream_id } = req.body;
    if (!name || !admission_no) {
      return res.status(400).json({ error: 'Name and admission number are required' });
    }
    const [result] = await db.query(
      'INSERT INTO students (name, admission_no, gender, class_stream_id) VALUES (?, ?, ?, ?)',
      [name, admission_no, gender, class_stream_id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create student' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, admission_no, gender, class_stream_id } = req.body;
    if (!name || !admission_no) {
      return res.status(400).json({ error: 'Name and admission number are required' });
    }
    await db.query(
      'UPDATE students SET name = ?, admission_no = ?, gender = ?, class_stream_id = ? WHERE id = ?',
      [name, admission_no, gender, class_stream_id, req.params.id]
    );
    res.json({ message: 'Student updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;