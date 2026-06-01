import React, { useState, useEffect } from 'react';
import { api } from '../api';
import PostCard from '../components/PostCard';
import './HomePage.css';

const HomePage = ({ onNavigateToPost }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('latest');

  useEffect(() => {
    loadPosts();
  }, [tab]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      let res;
      if (tab === 'latest') {
        res = await api.getLatestPosts();
      } else if (tab === 'trending') {
        res = await api.getTrendingPosts();
      } else {
        res = await api.getPosts();
      }
      setPosts(res.data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await api.searchPosts(searchQuery);
      setPosts(res.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };
  
  const handlePredict = (post) => {
    alert(`Prediction feature for post ${post.id} triggered via extension`);
  };

  return (
    <div className="home-page">
      <header className="page-header">
        <h1>📰 NewsGuard Social Feed</h1>
        <p>Real-time fake news detection powered by AI</p>
      </header>

      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="tabs">
        <button 
          className={tab === 'latest' ? 'active' : ''}
          onClick={() => setTab('latest')}
        >
          Latest
        </button>
        <button 
          className={tab === 'trending' ? 'active' : ''}
          onClick={() => setTab('trending')}
        >
          Trending
        </button>
        <button 
          className={tab === 'all' ? 'active' : ''}
          onClick={() => setTab('all')}
        >
          All
        </button>
      </div>

      <div className="posts-container">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="empty">No posts found</div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post}
              onPredict={handlePredict}
              onOpen={() => onNavigateToPost(post.id)} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
