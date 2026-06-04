const express = require('express');
const router = express.Router();
const db = require('../db');

// get all students in a stream, with their scores for a chosen subject
router.get('/', async (req, res) => {
  const { stream_id, subject_id, term = 1, year = 2026 } = req.query;
  if (!stream_id || !subject_id) {
    return res.status(400).json({ error: 'stream_id and subject_id are required' });
  }
  try {
    const [rows] = await db.query(
      `SELECT students.id AS student_id, students.name, students.admission_no,
              scores.cat_score, scores.exam_score
       FROM students
       LEFT JOIN scores
         ON scores.student_id = students.id
        AND scores.subject_id = ?
        AND scores.term = ?
        AND scores.year = ?
       WHERE students.class_stream_id = ?
       ORDER BY students.name`,
      [subject_id, term, year, stream_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// save (create or update) scores for a subject
router.post('/', async (req, res) => {
  const { subject_id, term = 1, year = 2026, scores } = req.body;
  if (!subject_id || !Array.isArray(scores)) {
    return res.status(400).json({ error: 'subject_id and scores are required' });
  }
  try {
    for (const s of scores) {
      const cat = Number(s.cat_score) || 0;
      const exam = Number(s.exam_score) || 0;
      if (cat < 0 || cat > 40 || exam < 0 || exam > 60) {
        return res.status(400).json({ error: 'CAT must be 0-40 and exam 0-60' });
      }
      await db.query(
        `INSERT INTO scores (student_id, subject_id, cat_score, exam_score, term, year)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE cat_score = VALUES(cat_score), exam_score = VALUES(exam_score)`,
        [s.student_id, subject_id, cat, exam, term, year]
      );
    }
    res.json({ message: 'Scores saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save scores' });
  }
});

module.exports = router;