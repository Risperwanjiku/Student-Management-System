import { useState, useEffect } from 'react';

const SCORES_URL = 'http://localhost:5000/api/scores';
const STREAMS_URL = 'http://localhost:5000/api/class-streams';
const SUBJECTS_URL = 'http://localhost:5000/api/subjects';

function Scores() {
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [streamId, setStreamId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStreams();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (streamId && subjectId) {
      fetchScores();
    } else {
      setRows([]);
    }
  }, [streamId, subjectId]);

  const fetchStreams = async () => {
    const res = await fetch(STREAMS_URL);
    setStreams(await res.json());
  };

  const fetchSubjects = async () => {
    const res = await fetch(SUBJECTS_URL);
    setSubjects(await res.json());
  };

  const fetchScores = async () => {
    try {
      const res = await fetch(`${SCORES_URL}?stream_id=${streamId}&subject_id=${subjectId}`);
      const data = await res.json();
      setRows(data.map((r) => ({
        student_id: r.student_id,
        name: r.name,
        admission_no: r.admission_no,
        cat_score: r.cat_score ?? '',
        exam_score: r.exam_score ?? '',
      })));
    } catch (err) {
      console.error('Failed to load scores:', err);
    }
  };

  const handleChange = (studentId, field, value) => {
    setRows(rows.map((row) =>
      row.student_id === studentId ? { ...row, [field]: value } : row
    ));
  };

  const handleSave = async () => {
    try {
      await fetch(SCORES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: subjectId,
          scores: rows.map((r) => ({
            student_id: r.student_id,
            cat_score: r.cat_score || 0,
            exam_score: r.exam_score || 0,
          })),
        }),
      });
      setMessage('Scores saved successfully');
      setTimeout(() => setMessage(''), 3000);
      fetchScores();
    } catch (err) {
      console.error('Failed to save scores:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Scores</h2>
          <p className="page-sub">Enter exam and CAT marks for each student.</p>
        </div>
        {streamId && subjectId && rows.length > 0 && (
          <button className="btn-primary" onClick={handleSave}>Save Scores</button>
        )}
      </div>

      <div className="filter-row">
        <select value={streamId} onChange={(e) => setStreamId(e.target.value)}>
          <option value="">Select class stream</option>
          {streams.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {message && <p className="success-msg">{message}</p>}

      {streamId && subjectId && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Admission No</th>
              <th>CAT (out of 40)</th>
              <th>Exam (out of 60)</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan="5">No students in this stream yet.</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.student_id}>
                  <td>{row.name}</td>
                  <td>{row.admission_no}</td>
                  <td>
                    <input type="number" className="score-input" value={row.cat_score}
                      onChange={(e) => handleChange(row.student_id, 'cat_score', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" className="score-input" value={row.exam_score}
                      onChange={(e) => handleChange(row.student_id, 'exam_score', e.target.value)} />
                  </td>
                  <td>{(Number(row.cat_score) || 0) + (Number(row.exam_score) || 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Scores;