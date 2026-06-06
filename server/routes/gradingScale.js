const express = require('express');
const router = express.Router();
const db = require('../db');

// get all grade bands, highest first
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM grading_scale ORDER BY min_score DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch grading scale' });
  }
});

// update the grade bands
router.put('/', async (req, res) => {
  const { scale } = req.body;
  if (!Array.isArray(scale)) {
    return res.status(400).json({ error: 'scale must be an array' });
  }
  try {
    for (const band of scale) {
      await db.query(
        'UPDATE grading_scale SET grade = ?, min_score = ?, max_score = ? WHERE id = ?',
        [band.grade, band.min_score, band.max_score, band.id]
      );
    }
    res.json({ message: 'Grading scale updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update grading scale' });
  }
});

module.exports = router;