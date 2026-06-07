import { useState, useEffect } from 'react';

const SCORES_URL = `${import.meta.env.VITE_API_URL}/api/scores`;
const STREAMS_URL = `${import.meta.env.VITE_API_URL}/api/class-streams`;

function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function Scores() {
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [streamId, setStreamId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [term, setTerm] = useState('1');
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStreams();
  }, []);

  useEffect(() => {
    setSubjectId('');
    setRows([]);
    if (streamId) {
      fetchStreamSubjects(streamId);
    } else {
      setSubjects([]);
    }
  }, [streamId]);

  useEffect(() => {
    if (streamId && subjectId) {
      fetchScores();
    } else {
      setRows([]);
    }
  }, [subjectId, term]);

  const fetchStreams = async () => {
    const res = await fetch(STREAMS_URL);
    setStreams(await res.json());
  };

  const fetchStreamSubjects = async (id) => {
    try {
      const res = await fetch(`${STREAMS_URL}/${id}/subjects`);
      setSubjects(await res.json());
    } catch (err) {
      console.error('Failed to load subjects:', err);
      setSubjects([]);
    }
  };

  const fetchScores = async () => {
    try {
      const res = await fetch(`${SCORES_URL}?stream_id=${streamId}&subject_id=${subjectId}&term=${term}&year=2026`);
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
          term: term,
          year: 2026,
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

      <div className="filter-card">
        <div className="filter-field">
          <label>Class Stream</label>
          <select value={streamId} onChange={(e) => setStreamId(e.target.value)}>
            <option value="">Select class stream</option>
            {streams.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label>Subject</label>
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!streamId}>
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label>Term</label>
          <select value={term} onChange={(e) => setTerm(e.target.value)}>
            <option value="1">Term 1, 2026</option>
            <option value="2">Term 2, 2026</option>
            <option value="3">Term 3, 2026</option>
          </select>
        </div>
      </div>

      {message && <p className="success-msg">{message}</p>}

      {streamId && subjects.length === 0 && (
        <p className="page-sub">This stream has no subjects assigned yet. Assign subjects on the Subjects page.</p>
      )}

      {streamId && subjectId && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Student</th>
                <th>CAT (out of 40)</th>
                <th>Exam (out of 60)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan="5">No students in this stream yet.</td></tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.student_id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="student-cell">
                        <span className="avatar">{getInitials(row.name)}</span>
                        <div>
                          <div className="student-name">{row.name}</div>
                          <div className="student-id">{row.admission_no}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input type="number" className="score-input" min="0" max="40" value={row.cat_score}
                        onChange={(e) => handleChange(row.student_id, 'cat_score', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" className="score-input" min="0" max="60" value={row.exam_score}
                        onChange={(e) => handleChange(row.student_id, 'exam_score', e.target.value)} />
                    </td>
                    <td>
                      <span className="total-pill">{(Number(row.cat_score) || 0) + (Number(row.exam_score) || 0)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Scores;