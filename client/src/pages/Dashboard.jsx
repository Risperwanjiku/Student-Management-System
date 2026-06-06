import { useState, useEffect } from 'react';
import { Users, Layers, BookOpen } from 'lucide-react';

const STUDENTS_URL = 'http://localhost:5000/api/students';
const STREAMS_URL = 'http://localhost:5000/api/class-streams';
const SUBJECTS_URL = 'http://localhost:5000/api/subjects';

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, streamsRes, subjectsRes] = await Promise.all([
        fetch(STUDENTS_URL),
        fetch(STREAMS_URL),
        fetch(SUBJECTS_URL),
      ]);
      setStudents(await studentsRes.json());
      setStreams(await streamsRes.json());
      setSubjects(await subjectsRes.json());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Overview</h2>
          <p className="page-sub">A quick glance at the academy's current status.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users size={20} /></div>
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{students.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Layers size={20} /></div>
          <div className="stat-label">Total Class Streams</div>
          <div className="stat-value">{streams.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><BookOpen size={20} /></div>
          <div className="stat-label">Total Subjects</div>
          <div className="stat-value">{subjects.length}</div>
        </div>
      </div>

      <h3 className="section-title">Students per Class Stream</h3>
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class Stream</th>
              <th>Students</th>
            </tr>
          </thead>
          <tbody>
            {streams.length === 0 ? (
              <tr>
                <td colSpan="2">No class streams yet.</td>
              </tr>
            ) : (
              streams.map((stream) => (
                <tr key={stream.id}>
                  <td>{stream.name}</td>
                  <td>{stream.student_count} students</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;