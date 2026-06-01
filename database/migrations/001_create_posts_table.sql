-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    post_message TEXT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    timestamp_post BIGINT NOT NULL,
    num_like_post INTEGER DEFAULT 0,
    num_comment_post INTEGER DEFAULT 0,
    num_share_post INTEGER DEFAULT 0,
    engagement_score FLOAT DEFAULT 0.0,
    text_length INTEGER DEFAULT 0,
    image_count INTEGER DEFAULT 0,
    label INTEGER NOT NULL,
    image_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_timestamp ON posts(timestamp_post DESC);
CREATE INDEX idx_posts_label ON posts(label);
CREATE INDEX idx_posts_user ON posts(user_name);
