import { useState, useEffect } from 'react';

const RESULTS_URL = `${import.meta.env.VITE_API_URL}/api/results`;
const STREAMS_URL = `${import.meta.env.VITE_API_URL}/api/class-streams`;

function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return n + 'th';
}

function Results() {
  const [streams, setStreams] = useState([]);
  const [streamId, setStreamId] = useState('');
  const [term, setTerm] = useState('1');
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [subjectPositions, setSubjectPositions] = useState({});

  useEffect(() => {
    fetchStreams();
  }, []);

  useEffect(() => {
    if (streamId) {
      fetchResults();
    } else {
      setResults([]);
      setSubjects([]);
    }
  }, [streamId, term]);

  const fetchStreams = async () => {
    const res = await fetch(STREAMS_URL);
    setStreams(await res.json());
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`${RESULTS_URL}?stream_id=${streamId}&term=${term}&year=2026`);
      const data = await res.json();
      setSubjects(data.subjects);
      setResults(data.results);
      setSubjectPositions(data.subjectPositions);
    } catch (err) {
      console.error('Failed to load results:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Results</h2>
          <p className="page-sub">Class performance, ranked by average.</p>
        </div>
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
          <label>Term</label>
          <select value={term} onChange={(e) => setTerm(e.target.value)}>
            <option value="1">Term 1, 2026</option>
            <option value="2">Term 2, 2026</option>
            <option value="3">Term 3, 2026</option>
          </select>
        </div>
      </div>

      {streamId && results.length === 0 && (
        <p className="page-sub">No results to show for this stream yet.</p>
      )}

      {results.length > 0 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                {subjects.map((sub) => (
                  <th key={sub.id}>{sub.name}</th>
                ))}
                <th>Total</th>
                <th>Average</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.student_id}>
                  <td>
                    <span className={r.position === 1 ? 'rank-badge top' : 'rank-badge'}>{r.position}</span>
                  </td>
                  <td>
                    <div className="student-cell">
                      <span className="avatar">{getInitials(r.name)}</span>
                      <div>
                        <div className="student-name">{r.name}</div>
                        <div className="student-id">{r.admission_no}</div>
                      </div>
                    </div>
                  </td>
                  {subjects.map((sub) => (
                    <td key={sub.id}>
                      {r.subjectMarks[sub.id] !== null ? (
                        <>
                          {r.subjectMarks[sub.id]}
                          {subjectPositions[sub.id]?.[r.student_id] && (
                            <span className="subj-pos"> ({ordinal(subjectPositions[sub.id][r.student_id])})</span>
                          )}
                        </>
                      ) : '-'}
                    </td>
                  ))}
                  <td>{r.total}</td>
                  <td>{r.average}%</td>
                  <td><span className="grade-pill">{r.grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Results;