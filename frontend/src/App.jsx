import { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [postId, setPostId] = useState(null);

  const navigateToPost = (id) => {
    setPostId(id);
    setCurrentPage('post');
  };

  const navigateHome = () => {
    setCurrentPage('home');
    setPostId(null);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand" onClick={navigateHome} style={{ cursor: 'pointer' }}>
          📰 NewsGuard
        </div>
        <div className="navbar-info">
          Chrome Extension enabled | Fake News Detection AI
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'home' ? (
          <HomePage onNavigateToPost={navigateToPost} />
        ) : (
          <PostDetailPage id={postId} onBack={navigateHome} />
        )}
      </main>

      <footer className="footer">
        <p>NewsGuard © 2026 | Multimodal Fake News Detection</p>
      </footer>
    </div>
  );
}

export default App;
