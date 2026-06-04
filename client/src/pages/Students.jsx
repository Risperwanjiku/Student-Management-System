import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/students';
const STREAMS_URL = 'http://localhost:5000/api/class-streams';

function Students() {
  const [students, setStudents] = useState([]);
  const [streams, setStreams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [gender, setGender] = useState('');
  const [classStreamId, setClassStreamId] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchStreams();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const fetchStreams = async () => {
    try {
      const res = await fetch(STREAMS_URL);
      const data = await res.json();
      setStreams(data);
    } catch (err) {
      console.error('Failed to load streams:', err);
    }
  };

  const handleSave = async () => {
    if (name.trim() === '' || admissionNo.trim() === '') return;
    const studentData = {
      name,
      admission_no: admissionNo,
      gender,
      class_stream_id: classStreamId || null,
    };
    try {
      if (editingId) {
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentData),
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentData),
        });
      }
      closeForm();
      fetchStudents();
    } catch (err) {
      console.error('Failed to save student:', err);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setName(student.name);
    setAdmissionNo(student.admission_no);
    setGender(student.gender || '');
    setClassStreamId(student.class_stream_id || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (err) {
      console.error('Failed to delete student:', err);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setAdmissionNo('');
    setGender('');
    setClassStreamId('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Students</h2>
          <p className="page-sub">Manage student records and class assignments.</p>
        </div>
        <button className="btn-primary" onClick={() => { closeForm(); setShowForm(true); }}>+ Add Student</button>
      </div>

      {showForm && (
        <div className="form-card-column">
          <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="Admission number" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} />
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <select value={classStreamId} onChange={(e) => setClassStreamId(e.target.value)}>
            <option value="">Select class stream</option>
            {streams.map((stream) => (
              <option key={stream.id} value={stream.id}>{stream.name}</option>
            ))}
          </select>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave}>{editingId ? 'Update' : 'Save'}</button>
            <button className="btn-link" onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Admission No</th>
            <th>Gender</th>
            <th>Class Stream</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.admission_no}</td>
              <td>{student.gender}</td>
              <td>{student.stream_name}</td>
              <td>
                <button className="btn-link" onClick={() => handleEdit(student)}>Edit</button>
                <button className="btn-link danger" onClick={() => handleDelete(student.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Students;