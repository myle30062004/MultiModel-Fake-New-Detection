-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    prediction VARCHAR(20) NOT NULL,
    confidence FLOAT NOT NULL,
    text_weight FLOAT NOT NULL,
    image_weight FLOAT NOT NULL,
    meta_weight FLOAT NOT NULL,
    trust_score FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predictions_post ON predictions(post_id);
CREATE INDEX idx_predictions_created ON predictions(created_at DESC);
CREATE INDEX idx_predictions_confidence ON predictions(confidence DESC);
