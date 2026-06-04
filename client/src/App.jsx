import { useState } from 'react';
import './App.css';
import ClassStreams from './pages/ClassStreams';
import Students from './pages/Students';
import Subjects from './pages/Subjects';
import Scores from './pages/Scores';
import Results from './pages/Results';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');

  const pages = ['Dashboard', 'Class Streams', 'Students', 'Subjects', 'Scores', 'Results', 'Reports'];

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="logo">Ikonex Academy</h1>
        <p className="logo-sub">Admin Portal</p>
        <nav>
          {pages.map((page) => (
            <button
              key={page}
              className={page === activePage ? 'nav-link active' : 'nav-link'}
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">
        {activePage === 'Class Streams' && <ClassStreams />}
        {activePage === 'Students' && <Students />}
        {activePage === 'Subjects' && <Subjects />}
        {activePage === 'Scores' && <Scores />}
        {activePage === 'Results' && <Results />}
        {!['Class Streams', 'Students', 'Subjects', 'Scores', 'Results'].includes(activePage) && (
          <>
            <h2>{activePage}</h2>
            <p>This page is coming soon.</p>
          </>
        )}
      </main>
    </div>
  );
}

export default App;