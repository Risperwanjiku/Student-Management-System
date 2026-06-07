import { useState, useEffect } from 'react';

const API_URL = `${import.meta.env.VITE_API_URL}/api/grading-scale`;

function Settings() {
  const [scale, setScale] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchScale();
  }, []);

  const fetchScale = async () => {
    try {
      const res = await fetch(API_URL);
      setScale(await res.json());
    } catch (err) {
      console.error('Failed to load grading scale:', err);
    }
  };

  const handleChange = (id, field, value) => {
    setScale(scale.map((band) =>
      band.id === id ? { ...band, [field]: value } : band
    ));
  };

  const handleSave = async () => {
    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scale }),
      });
      setMessage('Grading scale saved');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save grading scale:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="page-sub">Configure the grading scale used across the system.</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>Save Changes</button>
      </div>

      {message && <p className="success-msg">{message}</p>}

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Minimum Score</th>
              <th>Maximum Score</th>
            </tr>
          </thead>
          <tbody>
            {scale.map((band) => (
              <tr key={band.id}>
                <td>
                  <input
                    type="text"
                    className="score-input"
                    value={band.grade}
                    onChange={(e) => handleChange(band.id, 'grade', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="score-input"
                    value={band.min_score}
                    onChange={(e) => handleChange(band.id, 'min_score', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="score-input"
                    value={band.max_score}
                    onChange={(e) => handleChange(band.id, 'max_score', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Settings;