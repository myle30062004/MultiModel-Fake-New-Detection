import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export const api = {
  getPosts: (page = 1, limit = 20) =>
    axios.get(`${API_BASE}/posts`, { params: { page, limit } }),
  
  getPost: (id) =>
    axios.get(`${API_BASE}/posts/${id}`),
  
  getTrendingPosts: () =>
    axios.get(`${API_BASE}/posts/trending`),
  
  getLatestPosts: () =>
    axios.get(`${API_BASE}/posts/latest`),
  
  searchPosts: (query) =>
    axios.get(`${API_BASE}/posts/search`, { params: { q: query } }),
  
  predict: (payload) =>
    axios.post(`${API_BASE}/predict`, payload),
  
  getPredictions: (postId) =>
    axios.get(`${API_BASE}/posts/${postId}/predictions`),
  
  getStats: () =>
    axios.get(`${API_BASE}/stats`)
};
