import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/class-streams';

function ClassStreams() {
  const [streams, setStreams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await fetch(API_URL);
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
    if (newName.trim() === '') return;
    const isEdit = editingId;
    try {
      if (editingId) {
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        });
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        });
      }
      closeForm();
      fetchStreams();
      showMessage(isEdit ? 'Class stream updated' : 'Class stream added');
    } catch (err) {
      console.error('Failed to save stream:', err);
    }
  };

  const handleEdit = (stream) => {
    setEditingId(stream.id);
    setNewName(stream.name);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class stream? This cannot be undone.')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchStreams();
      showMessage('Class stream deleted');
    } catch (err) {
      console.error('Failed to delete stream:', err);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setNewName('');
    setEditingId(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Class Streams</h2>
          <p className="page-sub">Manage the academy's class streams.</p>
        </div>
        <button className="btn-primary" onClick={() => { closeForm(); setShowForm(true); }}>+ Add Stream</button>
      </div>

      {message && <p className="success-msg">{message}</p>}

      {showForm && (
        <div className="form-card">
          <input
            type="text"
            placeholder="Stream name (e.g. Form 1A)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="btn-primary" onClick={handleSave}>{editingId ? 'Update' : 'Save'}</button>
          <button className="btn-link" onClick={closeForm}>Cancel</button>
        </div>
      )}

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Stream Name</th>
              <th>Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {streams.length === 0 ? (
              <tr>
                <td colSpan="3">No class streams added yet.</td>
              </tr>
            ) : (
              streams.map((stream) => (
                <tr key={stream.id}>
                  <td>{stream.name}</td>
                  <td>{stream.student_count} students</td>
                  <td>
                    <button className="icon-btn" title="Edit" onClick={() => handleEdit(stream)}>
                      <Pencil size={16} />
                    </button>
                    <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(stream.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClassStreams;