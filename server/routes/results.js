const express = require('express');
const router = express.Router();
const db = require('../db');

function getGrade(score, scale) {
  const sorted = [...scale].sort((a, b) => b.min_score - a.min_score);
  const match = sorted.find((g) => score >= g.min_score);
  return match ? match.grade : '-';
}

router.get('/', async (req, res) => {
  const streamId = req.query.stream_id;
  const term = req.query.term || 1;
  const year = req.query.year || 2026;

  if (!streamId) {
    return res.status(400).json({ error: 'stream_id is required' });
  }

  try {
    const [students] = await db.query(
      'SELECT id, name, admission_no FROM students WHERE class_stream_id = ?',
      [streamId]
    );

    const [subjects] = await db.query(
      `SELECT s.id, s.name
       FROM subjects s
       JOIN subject_streams ss ON ss.subject_id = s.id
       WHERE ss.class_stream_id = ?
       ORDER BY s.name`,
      [streamId]
    );

    const [scores] = await db.query(
      `SELECT sc.student_id, sc.subject_id, sc.cat_score, sc.exam_score
       FROM scores sc
       JOIN students st ON sc.student_id = st.id
       WHERE st.class_stream_id = ? AND sc.term = ? AND sc.year = ?`,
      [streamId, term, year]
    );

    const [scale] = await db.query('SELECT grade, min_score, max_score FROM grading_scale');

    const results = students.map((student) => {
      const subjectMarks = {};
      const subjectGrades = {};
      let total = 0;

      subjects.forEach((subject) => {
        const found = scores.find(
          (s) => s.student_id === student.id && s.subject_id === subject.id
        );
        const mark = found ? Number(found.cat_score) + Number(found.exam_score) : null;
        subjectMarks[subject.id] = mark;
        subjectGrades[subject.id] = mark !== null ? getGrade(mark, scale) : null;
        if (mark !== null) total += mark;
      });

      const subjectsTaken = Object.values(subjectMarks).filter((m) => m !== null).length;
      const average = subjectsTaken > 0 ? total / subjectsTaken : 0;

      return {
        student_id: student.id,
        name: student.name,
        admission_no: student.admission_no,
        subjectMarks,
        subjectGrades,
        total,
        average: Math.round(average * 100) / 100,
        grade: getGrade(average, scale),
      };
    });

    const ranked = [...results].sort((a, b) => b.average - a.average);
    ranked.forEach((r, index) => {
      r.position = index + 1;
    });

    const subjectPositions = {};
    subjects.forEach((subject) => {
      subjectPositions[subject.id] = {};
      const withMark = results
        .filter((r) => r.subjectMarks[subject.id] !== null)
        .sort((a, b) => b.subjectMarks[subject.id] - a.subjectMarks[subject.id]);
      withMark.forEach((r, index) => {
        subjectPositions[subject.id][r.student_id] = index + 1;
      });
    });

    res.json({ subjects, results: ranked, subjectPositions });
  } catch (err) {
    console.error('Error generating results:', err);
    res.status(500).json({ error: 'Failed to generate results' });
  }
});

module.exports = router;