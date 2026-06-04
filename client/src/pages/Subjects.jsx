import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/subjects';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    fetchSubjects();
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

  const handleSave = async () => {
    if (name.trim() === '' || code.trim() === '') return;
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
    } catch (err) {
      console.error('Failed to save subject:', err);
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject.id);
    setName(subject.name);
    setCode(subject.code);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchSubjects();
    } catch (err) {
      console.error('Failed to delete subject:', err);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setCode('');
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

      {showForm && (
        <div className="form-card-column">
          <input type="text" placeholder="Subject name (e.g. Mathematics)" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="Subject code (e.g. MAT-101)" value={code} onChange={(e) => setCode(e.target.value)} />
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave}>{editingId ? 'Update' : 'Save'}</button>
            <button className="btn-link" onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Subject Name</th>
            <th>Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.id}>
              <td>{subject.name}</td>
              <td>{subject.code}</td>
              <td>
                <button className="btn-link" onClick={() => handleEdit(subject)}>Edit</button>
                <button className="btn-link danger" onClick={() => handleDelete(subject.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Subjects;