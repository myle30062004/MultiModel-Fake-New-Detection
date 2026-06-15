import axios from 'axios';
import { samplePosts } from '../assets/sampleData';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const normalizePost = (post = {}) => ({
  id: post.id,
  user_name: post.user_name || post.author || 'Verified community member',
  post_message: post.post_message || post.content || post.message || '',
  timestamp_post: post.timestamp_post || post.created_at || Date.now(),
  num_like_post: normalizeNumber(post.num_like_post),
  num_comment_post: normalizeNumber(post.num_comment_post),
  num_share_post: normalizeNumber(post.num_share_post),
  engagement_score: normalizeNumber(post.engagement_score),
  text_length: normalizeNumber(post.text_length, String(post.post_message || '').length),
  image_count: normalizeNumber(post.image_count, post.image_path ? 1 : 0),
  label: post.label,
  image_path: post.image_path || post.image_url || null,
});

export const normalizePrediction = (prediction = {}) => {
  const label = prediction.prediction || prediction.label || 'UNKNOWN';
  const confidence = normalizeNumber(prediction.confidence);
  const fakeProbability =
    prediction.fake_probability ?? (String(label).toUpperCase().includes('FAKE') ? confidence : 1 - confidence);

  return {
    id: prediction.id || crypto.randomUUID?.() || `${Date.now()}`,
    label,
    confidence,
    model: prediction.model || 'Multimodal Fusion v1',
    processing_time: normalizeNumber(prediction.processing_time || prediction.latency || 0.82),
    text_weight: normalizeNumber(prediction.text_weight),
    image_weight: normalizeNumber(prediction.image_weight),
    meta_weight: normalizeNumber(prediction.meta_weight),
    trust_score: normalizeNumber(prediction.trust_score),
    fact_check_score: normalizeNumber(prediction.fact_check_score),
    fake_probability: normalizeNumber(fakeProbability),
    real_probability: normalizeNumber(prediction.real_probability ?? 1 - fakeProbability),
    suspicious_phrases: prediction.suspicious_phrases || [],
    explanations: prediction.explanations || [],
    created_at: prediction.created_at || new Date().toISOString(),
  };
};

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${API_BASE_URL}/${String(imagePath).replace(/\\/g, '/').replace(/^\/+/, '')}`;
};

const normalizePosts = (data) => {
  const rows = Array.isArray(data) ? data : data?.items || data?.posts || [];
  return rows.map(normalizePost);
};

export const newsApi = {
  async getPosts(page = 1, limit = 12) {
    const { data } = await client.get('/posts', { params: { page, limit } });
    return normalizePosts(data);
  },

  async getLatestPosts(limit = 12) {
    const { data } = await client.get('/posts/latest', { params: { limit } });
    return normalizePosts(data);
  },

  async getTrendingPosts(limit = 12) {
    const { data } = await client.get('/posts/trending', { params: { limit } });
    return normalizePosts(data);
  },

  async searchPosts(query, limit = 20) {
    const { data } = await client.get('/posts/search', { params: { q: query, limit } });
    return normalizePosts(data);
  },

  async getPost(id) {
    const { data } = await client.get(`/posts/${id}`);
    return normalizePost(data);
  },

  async getPredictions(postId) {
    const { data } = await client.get(`/posts/${postId}/predictions`);
    return (Array.isArray(data) ? data : []).map(normalizePrediction);
  },

  async predict(payload) {
    const { data } = await client.post('/predict', payload);
    return normalizePrediction(data);
  },

  async getStats() {
    const { data } = await client.get('/stats');
    return data;
  },
};

export const fallbackPosts = samplePosts.map(normalizePost);

export default client;
