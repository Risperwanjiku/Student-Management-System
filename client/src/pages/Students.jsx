import { useState, useEffect } from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api/students`;
const STREAMS_URL = `${import.meta.env.VITE_API_URL}/api/class-streams`;

function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// build the list of page numbers to show, with ... for long lists
function getPageNumbers(current, total) {
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
}

// style for the non-active page / arrow buttons
const pageBtnStyle = (disabled) => ({
  minWidth: '36px',
  height: '36px',
  padding: '0 10px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  background: '#fff',
  color: disabled ? '#cbd5e1' : '#374151',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '14px',
});

function Students({ search = '' }) {
  const [students, setStudents] = useState([]);
  const [streams, setStreams] = useState([]);
  const [streamFilter, setStreamFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [name, setName] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [gender, setGender] = useState('');
  const [classStreamId, setClassStreamId] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchStreams();
  }, []);

  // go back to page 1 whenever the search or stream filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, streamFilter]);

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

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async () => {
   if (name.trim() === '' || admissionNo.trim() === '' || gender === '' || classStreamId === '') {
      setError('Please fill in all the fields.');
      return;
    }
    setError('');
    const isEdit = editingId;
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
      showMessage(isEdit ? 'Student updated' : 'Student added');
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
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchStudents();
      showMessage('Student deleted');
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
    setError('');
  };

  // open a single student's details
  const handleView = (student) => {
    setSelectedStudent(student);
  };

  const closeView = () => {
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter((student) => {
    const term = search.toLowerCase();
    const matchesSearch =
      student.name.toLowerCase().includes(term) ||
      student.admission_no.toLowerCase().includes(term);
    const matchesStream =
      streamFilter === '' || String(student.class_stream_id) === streamFilter;
    return matchesSearch && matchesStream;
  });

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const startIndex = filteredStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredStudents.length);

  // if a deletion leaves us past the last page, step back
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // detail view for a single student
  if (selectedStudent) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h2>{selectedStudent.name}</h2>
            <p className="page-sub">Student details.</p>
          </div>
          <button className="btn-link" onClick={closeView}>← Back to students</button>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Admission Number</th>
                <th>Gender</th>
                <th>Class Stream</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="student-cell">
                    <span className="avatar">{getInitials(selectedStudent.name)}</span>
                    <div className="student-name">{selectedStudent.name}</div>
                  </div>
                </td>
                <td>{selectedStudent.admission_no}</td>
                <td>{selectedStudent.gender || '-'}</td>
                <td>{selectedStudent.stream_name ? <span className="stream-pill">{selectedStudent.stream_name}</span> : '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Students</h2>
          <p className="page-sub">Manage student records and class assignments.</p>
        </div>
        <button className="btn-primary" onClick={() => { closeForm(); setShowForm(true); }}>+ Add Student</button>
      </div>

      {message && <p className="success-msg">{message}</p>}

      {showForm && (
        <div className="form-card-column">
          {error && <p className="error-msg">{error}</p>}
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

      <div className="filter-bar">
        <select value={streamFilter} onChange={(e) => setStreamFilter(e.target.value)}>
          <option value="">All streams</option>
          {streams.map((stream) => (
            <option key={stream.id} value={stream.id}>{stream.name}</option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Admission Number</th>
              <th>Class Stream</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="4">{search || streamFilter ? 'No students match your filters.' : 'No students added yet.'}</td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-cell">
                      <span className="avatar">{getInitials(student.name)}</span>
                      <div>
                        <div className="student-name" style={{ cursor: 'pointer' }} onClick={() => handleView(student)}>{student.name}</div>
                        <div className="student-gender">{student.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td>{student.admission_no}</td>
                  <td>{student.stream_name ? <span className="stream-pill">{student.stream_name}</span> : '-'}</td>
                  <td>
                    <button className="icon-btn" title="View" onClick={() => handleView(student)}>
                      <Eye size={16} />
                    </button>
                    <button className="icon-btn" title="Edit" onClick={() => handleEdit(student)}>
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(student.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filteredStudents.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '14px 16px', borderTop: '1px solid #f0f0f0' }}>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              Showing {startIndex} to {endIndex} of {filteredStudents.length} results
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={pageBtnStyle(currentPage === 1)}
              >
                ‹
              </button>
              {getPageNumbers(currentPage, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#9ca3af' }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={p === currentPage ? 'btn-primary' : ''}
                    style={
                      p === currentPage
                        ? { minWidth: '36px', height: '36px', padding: '0 10px', borderRadius: '8px', fontSize: '14px', border: 'none', cursor: 'pointer' }
                        : pageBtnStyle(false)
                    }
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={pageBtnStyle(currentPage === totalPages)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Students;