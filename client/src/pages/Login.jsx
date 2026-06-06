import { useState } from 'react';

const LOGIN_URL = 'http://localhost:5000/api/auth/login';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      onLogin(data.token, data.username);
    } catch (err) {
      setError('Could not connect to the server');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1 className="logo">Ikonex Academy</h1>
        <p className="logo-sub">Admin Portal</p>

        <h2 className="login-title">Sign in</h2>

        {error && <p className="error-msg">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn-primary" onClick={handleSubmit}>Sign in</button>
      </div>
    </div>
  );
}

export default Login;