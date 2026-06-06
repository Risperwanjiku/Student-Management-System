import { useState, useEffect } from 'react';
import { Pencil, Trash2, BookOpen, Layers } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/subjects';
const STREAMS_URL = 'http://localhost:5000/api/class-streams';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [streams, setStreams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [assigningSubject, setAssigningSubject] = useState(null);
  const [assignedStreamIds, setAssignedStreamIds] = useState([]);

  useEffect(() => {
    fetchSubjects();
    fetchStreams();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
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
    if (name.trim() === '' || code.trim() === '') {
      setError('Please enter a subject name and code.');
      return;
    }
    setError('');
    const isEdit = editingId;
    const subjectData = { name, code };
    try {
      if (editingId) {
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subjectData),
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subjectData),
        });
      }
      closeForm();
      fetchSubjects();
      showMessage(isEdit ? 'Subject updated' : 'Subject added');
    } catch (err) {
      console.error('Failed to save subject:', err);
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject.id);
    setName(subject.name);
    setCode(subject.code);
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject? This cannot be undone.')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchSubjects();
      showMessage('Subject deleted');
    } catch (err) {
      console.error('Failed to delete subject:', err);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setCode('');
    setError('');
  };

  const openAssign = async (subject) => {
    setAssigningSubject(subject);
    try {
      const res = await fetch(`${API_URL}/${subject.id}/streams`);
      const data = await res.json();
      setAssignedStreamIds(data);
    } catch (err) {
      console.error('Failed to load subject streams:', err);
      setAssignedStreamIds([]);
    }
  };

  const toggleStream = (streamId) => {
    setAssignedStreamIds((prev) =>
      prev.includes(streamId) ? prev.filter((id) => id !== streamId) : [...prev, streamId]
    );
  };

  const saveAssignments = async () => {
    try {
      await fetch(`${API_URL}/${assigningSubject.id}/streams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream_ids: assignedStreamIds }),
      });
      setAssigningSubject(null);
      fetchSubjects();
      showMessage('Subject assignments updated');
    } catch (err) {
      console.error('Failed to save assignments:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Subjects</h2>
          <p className="page-sub">Manage the subjects offered by the school.</p>
        </div>
        <button className="btn-primary" onClick={() => { closeForm(); setShowForm(true); }}>+ Add Subject</button>
      </div>

      {message && <p className="success-msg">{message}</p>}

      {showForm && (
        <div className="form-card-column">
          {error && <p className="error-msg">{error}</p>}
          <input type="text" placeholder="Subject name (e.g. Mathematics)" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="Subject code (e.g. MAT-101)" value={code} onChange={(e) => setCode(e.target.value)} />
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave}>{editingId ? 'Update' : 'Save'}</button>
            <button className="btn-link" onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <p className="page-sub">No subjects added yet.</p>
      ) : (
        <div className="card-grid">
          {subjects.map((subject) => (
            <div className="subject-card" key={subject.id}>
              <div className="subject-card-icon"><BookOpen size={20} /></div>
              <div className="subject-card-name">{subject.name}</div>
              <div className="subject-card-code">{subject.code}</div>
              <div className="subject-card-streams">
                {subject.streams
                  ? subject.streams.split(',').map((s) => (
                      <span className="stream-pill" key={s}>{s}</span>
                    ))
                  : <span className="subject-card-unassigned">Not assigned to any stream</span>}
              </div>
              <div className="subject-card-actions">
                <button className="icon-btn" title="Assign to streams" onClick={() => openAssign(subject)}>
                  <Layers size={16} />
                </button>
                <button className="icon-btn" title="Edit" onClick={() => handleEdit(subject)}>
                  <Pencil size={16} />
                </button>
                <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(subject.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {assigningSubject && (
        <div className="modal-overlay" onClick={() => setAssigningSubject(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Assign {assigningSubject.name}</h3>
            <p className="modal-sub">Choose which class streams take this subject.</p>
            {streams.length === 0 ? (
              <p className="page-sub">No class streams yet.</p>
            ) : (
              streams.map((stream) => (
                <label className="checkbox-row" key={stream.id}>
                  <input
                    type="checkbox"
                    checked={assignedStreamIds.includes(stream.id)}
                    onChange={() => toggleStream(stream.id)}
                  />
                  {stream.name}
                </label>
              ))
            )}
            <div className="modal-actions">
              <button className="btn-primary" onClick={saveAssignments}>Save Changes</button>
              <button className="btn-link" onClick={() => setAssigningSubject(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Subjects;