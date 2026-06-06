import { useState } from 'react';
import './App.css';
import {
  LayoutDashboard, Layers, Users, BookOpen,
  ClipboardList, Trophy, FileText, Search, Settings as SettingsIcon, LogOut
} from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClassStreams from './pages/ClassStreams';
import Students from './pages/Students';
import Subjects from './pages/Subjects';
import Scores from './pages/Scores';
import Results from './pages/Results';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const pages = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Class Streams', icon: Layers },
  { name: 'Students', icon: Users },
  { name: 'Subjects', icon: BookOpen },
  { name: 'Scores', icon: ClipboardList },
  { name: 'Results', icon: Trophy },
  { name: 'Reports', icon: FileText },
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [activePage, setActivePage] = useState('Dashboard');
  const [search, setSearch] = useState('');

  const handleLogin = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
  };

  const handleLogout = () => {
    setToken('');
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  const handleSearch = (value) => {
    setSearch(value);
    if (value !== '') setActivePage('Students');
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="logo">Ikonex Academy</h1>
        <p className="logo-sub">Admin Portal</p>
        <nav>
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <button
                key={page.name}
                className={page.name === activePage ? 'nav-link active' : 'nav-link'}
                onClick={() => setActivePage(page.name)}
              >
                <Icon size={18} />
                <span>{page.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="topbar-right">
            <button className="icon-btn" title="Settings" onClick={() => setActivePage('Settings')}>
              <SettingsIcon size={18} />
            </button>
            <div className="admin-badge">{username ? username.slice(0, 2).toUpperCase() : 'IA'}</div>
            <button className="icon-btn" title="Log out" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="content">
          {activePage === 'Dashboard' && <Dashboard />}
          {activePage === 'Class Streams' && <ClassStreams />}
          {activePage === 'Students' && <Students search={search} />}
          {activePage === 'Subjects' && <Subjects />}
          {activePage === 'Scores' && <Scores />}
          {activePage === 'Results' && <Results />}
          {activePage === 'Reports' && <Reports />}
          {activePage === 'Settings' && <Settings />}
          {!['Dashboard', 'Class Streams', 'Students', 'Subjects', 'Scores', 'Results', 'Reports', 'Settings'].includes(activePage) && (
            <>
              <h2>{activePage}</h2>
              <p>This page is coming soon.</p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;