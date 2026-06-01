import React from 'react';
import './PostCard.css';

const PostCard = ({ post, onPredict, onOpen }) => {

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div
      className="post-card"
      data-post-id={post.id}
      onClick={onOpen}   // 👈 CLICK TO OPEN DETAIL
      style={{ cursor: 'pointer' }}
    >
      <div className="post-header">
        <span className="post-user">{post.user_name}</span>
        <span className="post-time">
          {formatDate(post.timestamp_post)}
        </span>
      </div>

      {post.image_path && (
        <div className="post-image-container">
          <img 
            src={`http://localhost:8000/${post.image_path.replace(/\\/g, "/")}`}
            alt="post"
            className="post-image"
          />
        </div>
      )}

      <div className="post-content">
        <p className="post-message">{post.post_message}</p>
      </div>

      <div className="post-stats">
        <span className="post-likes">
          <strong>{post.num_like_post}</strong> Likes
        </span>
        <span className="post-comments">
          <strong>{post.num_comment_post}</strong> Comments
        </span>
        <span className="post-shares">
          <strong>{post.num_share_post}</strong> Shares
        </span>
        <span className="post-engagement">
          Engagement: <strong>{post.engagement_score.toFixed(0)}</strong>
        </span>
      </div>

      <div className="post-metadata">
        <span>Text: {post.text_length}</span>
        <span>Images: {post.image_count}</span>
      </div>

      <button
        className="post-analyze-btn"
        onClick={(e) => {
          e.stopPropagation(); // 👈 KHÔNG trigger open detail
          onPredict(post);
        }}
      >
        🔍 Analyze with Extension
      </button>
    </div>
  );
};

export default PostCard;