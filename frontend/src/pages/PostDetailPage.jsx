import React, { useState, useEffect } from 'react';
import { api } from '../api';
import './PostDetailPage.css';

const PostDetailPage = ({ id, onBack }) => {
  const [post, setPost] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const res = await api.getPost(id);
      setPost(res.data);
      
      try {
        const predRes = await api.getPredictions(id);
        setPredictions(predRes.data);
      } catch (e) {
        console.log('No predictions yet');
      }
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!post) return <div className="error">Post not found</div>;

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const latestPrediction = predictions[0];

  return (
    <div className="post-detail-page">
      <div className="post-detail-header">
        <h1>Post Details</h1>
        <a href="/">← Back to Feed</a>
      </div>

      <div className="post-detail-card" data-post-id={post.id}>
        {/* User Info */}
        <div className="detail-section user-section">
          <span className="label">Posted by:</span>
          <span className="post-user">{post.user_name}</span>
        </div>

        {/* Timestamp */}
        <div className="detail-section time-section">
          <span className="label">Posted at:</span>
          <span className="post-time">{formatDate(post.timestamp_post)}</span>
        </div>

        {/* Image */}
        {post.image_path && (
          <div className="image-section">
            <img 
              src={`http://localhost:8000/${post.image_path.replace(/\\/g, "/")}`}
              alt="post"
              className="post-image"
            />
          </div>
        )}

        {/* Message Content */}
        <div className="message-section">
          <span className="label">Content:</span>
          <p className="post-message">{post.post_message}</p>
        </div>

        {/* Engagement Stats */}
        <div className="engagement-section">
          <div className="stat">
            <strong className="post-likes">{post.num_like_post}</strong>
            <span>Likes</span>
          </div>
          <div className="stat">
            <strong className="post-comments">{post.num_comment_post}</strong>
            <span>Comments</span>
          </div>
          <div className="stat">
            <strong className="post-shares">{post.num_share_post}</strong>
            <span>Shares</span>
          </div>
          <div className="stat">
            <strong className="post-engagement">{post.engagement_score.toFixed(0)}</strong>
            <span>Engagement</span>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="metadata-section">
          <h3>Metadata</h3>
          <table>
            <tbody>
              <tr>
                <td>User Name</td>
                <td className="post-user">{post.user_name}</td>
              </tr>
              <tr>
                <td>Timestamp</td>
                <td className="post-time">{post.timestamp_post}</td>
              </tr>
              <tr>
                <td>Likes</td>
                <td className="post-likes">{post.num_like_post}</td>
              </tr>
              <tr>
                <td>Comments</td>
                <td className="post-comments">{post.num_comment_post}</td>
              </tr>
              <tr>
                <td>Shares</td>
                <td className="post-shares">{post.num_share_post}</td>
              </tr>
              <tr>
                <td>Engagement Score</td>
                <td className="post-engagement">{post.engagement_score.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Text Length</td>
                <td>{post.text_length}</td>
              </tr>
              <tr>
                <td>Image Count</td>
                <td>{post.image_count}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Prediction Results */}
        {latestPrediction && (
          <div className="prediction-section">
            <h3>Latest Prediction</h3>
            <div className={`prediction-badge ${latestPrediction.prediction.toLowerCase()}`}>
              {latestPrediction.prediction}
            </div>
            <p className="confidence">
              Confidence: <strong>{(latestPrediction.confidence * 100).toFixed(1)}%</strong>
            </p>
            <div className="weights">
              <div className="weight-item">
                <span>Text Weight:</span>
                <strong>{latestPrediction.text_weight.toFixed(3)}</strong>
              </div>
              <div className="weight-item">
                <span>Image Weight:</span>
                <strong>{latestPrediction.image_weight.toFixed(3)}</strong>
              </div>
              <div className="weight-item">
                <span>Metadata Weight:</span>
                <strong>{latestPrediction.meta_weight.toFixed(3)}</strong>
              </div>
              <div className="weight-item">
                <span>Trust Score:</span>
                <strong>{latestPrediction.trust_score.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
