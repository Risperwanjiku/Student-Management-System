import { useState } from 'react';

const LOGIN_URL = 'http://localhost:5000/api/auth/login';

// demo account — intentionally public so reviewers can get in with one click
const DEMO_USER = 'demo';
const DEMO_PASS = 'demo123';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const doLogin = async (user, pass) => {
    setError('');
    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
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

  const handleSubmit = () => doLogin(username, password);
  const handleDemoLogin = () => doLogin(DEMO_USER, DEMO_PASS);

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

        <div className="login-divider">or</div>

        <button className="btn-secondary" onClick={handleDemoLogin}>Sign in as demo admin</button>
        <p className="login-hint">For reviewers — no account needed.</p>
      </div>
    </div>
  );
}

export default Login;