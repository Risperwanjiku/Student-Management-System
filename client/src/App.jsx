import { useState } from 'react';
import './App.css';
import {
  LayoutDashboard, Layers, Users, BookOpen,
  ClipboardList, Trophy, FileText, Search, Settings as SettingsIcon
} from 'lucide-react';
import ClassStreams from './pages/ClassStreams';
import Students from './pages/Students';
import Subjects from './pages/Subjects';
import Scores from './pages/Scores';
import Results from './pages/Results';
import Reports from './pages/Reports';

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
  const [activePage, setActivePage] = useState('Dashboard');
  const [search, setSearch] = useState('');

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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="topbar-right">
            <button className="icon-btn" title="Settings" onClick={() => setActivePage('Settings')}>
              <SettingsIcon size={18} />
            </button>
            <div className="admin-badge">IA</div>
          </div>
        </header>

        <main className="content">
          {activePage === 'Class Streams' && <ClassStreams />}
          {activePage === 'Students' && <Students />}
          {activePage === 'Subjects' && <Subjects />}
          {activePage === 'Scores' && <Scores />}
          {activePage === 'Results' && <Results />}
          {activePage === 'Reports' && <Reports />}
          {!['Class Streams', 'Students', 'Subjects', 'Scores', 'Results', 'Reports'].includes(activePage) && (
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