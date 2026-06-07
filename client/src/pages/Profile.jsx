import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

function getInitials(name) {
  if (!name) return '';
  return name.slice(0, 2).toUpperCase();
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleUpdatePassword = async () => {
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not update password');
        return;
      }
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Could not connect to the server');
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>My Profile</h2>
          <p className="page-sub">Your account details.</p>
        </div>
      </div>

      <div className="profile-grid">
        {profile && (
          <div className="profile-panel">
            <div className="profile-head">
              <div className="profile-avatar">{getInitials(profile.username)}</div>
              <div>
                <div className="profile-username">{profile.username}</div>
                <span className="profile-role">Administrator</span>
              </div>
            </div>

            <div className="profile-divider"></div>

            <div className="profile-details">
              <div>
                <div className="profile-detail-label">Username</div>
                <div className="profile-detail-value">{profile.username}</div>
              </div>
              <div>
                <div className="profile-detail-label">Account Type</div>
                <div className="profile-detail-value">Administrator</div>
              </div>
              <div>
                <div className="profile-detail-label">Member Since</div>
                <div className="profile-detail-value">{formatDate(profile.created_at)}</div>
              </div>
            </div>
          </div>
        )}

        <div className="profile-panel">
          <div className="panel-title">
            <Lock size={16} /> Change Password
          </div>

          {message && <p className="success-msg">{message}</p>}
          {error && <p className="error-msg">{error}</p>}

          <div className="profile-field">
            <label>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="profile-field">
            <label>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="profile-field">
            <label>Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button className="btn-primary" onClick={handleUpdatePassword}>Update Password</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;