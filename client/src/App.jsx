import { useState } from 'react';
import './App.css';
import ClassStreams from './pages/ClassStreams';

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
        {activePage === 'Class Streams' ? (
          <ClassStreams />
        ) : (
          <>
            <h2>{activePage}</h2>
            <p>This is the {activePage} page.</p>
          </>
        )}
      </main>
    </div>
  );
}

export default App;