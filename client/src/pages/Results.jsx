import { useState, useEffect } from 'react';

const RESULTS_URL = 'http://localhost:5000/api/results';
const STREAMS_URL = 'http://localhost:5000/api/class-streams';

function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return n + 'th';
}

function Results() {
  const [streams, setStreams] = useState([]);
  const [streamId, setStreamId] = useState('');
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
  }, [streamId]);

  const fetchStreams = async () => {
    const res = await fetch(STREAMS_URL);
    setStreams(await res.json());
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`${RESULTS_URL}?stream_id=${streamId}`);
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

      <div className="filter-row">
        <select value={streamId} onChange={(e) => setStreamId(e.target.value)}>
          <option value="">Select class stream</option>
          {streams.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {streamId && results.length === 0 && (
        <p>No results to show for this stream yet.</p>
      )}

      {results.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Student</th>
              <th>Admission No</th>
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
                <td>{ordinal(r.position)}</td>
                <td>{r.name}</td>
                <td>{r.admission_no}</td>
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
                <td>{r.average}</td>
                <td>{r.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Results;