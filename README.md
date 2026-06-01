# NewsGuard: Multimodal Fake News Detection Platform 📰🔍

A **production-ready**, **end-to-end** fake news detection system powered by multimodal AI (text + image + metadata analysis) with a Chrome extension, React frontend, and FastAPI backend.

## ✨ Features

✅ **Multimodal Analysis**: Text (PhoBERT), Image (ResNet18), Metadata (Custom Neural Network)  
✅ **Real-time Predictions**: Sub-second inference with PyTorch optimization  
✅ **Chrome Extension**: Direct integration with web browsers  
✅ **Interactive Frontend**: React + Vite with dark mode, trending posts, search  
✅ **PostgreSQL Database**: Full posts & prediction history tracking  
✅ **Docker Orchestration**: Complete stack deployable with one command  
✅ **Fact-Checking Integration**: Automated verification via Snopes, Reuters, Google Fact-Check  
✅ **REST API**: Comprehensive endpoint suite for all operations  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
│  (Content Extraction → API Call → Prediction Display)        │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP POST /predict
                 │ (title, content, image_url, metadata)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                            │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│ │ Predictor    │  │ Database     │  │ Fact-Checker │        │
│ │ (PyTorch)    │  │ (PostgreSQL) │  │ (APIs)       │        │
│ └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                               │
│  MultiModel: Text(1024) + Image(128) + Metadata(32)         │
│            ↓ Gated Fusion ↓ Classifier ↓ Output             │
│  {label, confidence, weights, explanations}                 │
└──────┬────────────────────────────────────────────────────┬─┘
       │                                                      │
       │ /posts, /predict, /stats                           │
       │                                                      │
       ▼                                                      ▼
┌──────────────────┐                                  ┌──────────────────┐
│ React Frontend   │◄─────────────────────────────────│  PostgreSQL DB   │
│ (Social Feed UI) │      /posts, /posts/{id}, etc    │  (Posts, Preds)  │
└──────────────────┘                                  └──────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Docker (with GPU support optional but recommended)
- Python 3.12+ (for manual setup)
- Node.js 20+ (for frontend development)

### Docker (Recommended)

```bash
# Clone and navigate
cd VinhPhu

# Build and start all services
docker-compose build
docker-compose up -d

# Verify services
docker-compose ps

# Access:
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # macOS/Linux or .venv\Scripts\activate on Windows
pip install -r requirements.txt
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/newsguard"
uvicorn app:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Starts on localhost:5173
```

**Database (Docker):**
```bash
docker run -d \
  -e POSTGRES_DB=newsguard \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

---

## 📦 Data Import

Load your Apache Arrow/Parquet dataset:

```bash
python scripts/import_arrow.py \
  --arrow /path/to/dataset.parquet \
  --db-url "postgresql://postgres:postgres@localhost:5432/newsguard" \
  --output-dir uploads/images
```

This extracts images, calculates metadata, and populates the database.

---

## 🧩 Chrome Extension

### Installation
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select `chrome_extension/` folder
4. Extension now appears in toolbar

### Usage
1. Navigate to any article webpage
2. Click 📰 NewsGuard icon
3. Click "Analyze Page"
4. View results: Prediction, confidence, component weights, metadata

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/predict` | Run inference on content |
| **GET** | `/posts` | List all posts (paginated) |
| **GET** | `/posts/{id}` | Get single post details |
| **GET** | `/posts/trending` | Top posts by engagement |
| **GET** | `/posts/latest` | Recently added posts |
| **GET** | `/posts/search?q=` | Search post content |
| **GET** | `/posts/{id}/predictions` | Prediction history for post |
| **GET** | `/stats` | Platform statistics |
| **GET** | `/health` | Service health check |
| **GET** | `/docs` | Interactive Swagger UI |

### Example Prediction Request
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Breaking News",
    "content": "Article text content here...",
    "image_url": "https://example.com/image.jpg"
  }'
```

### Example Response
```json
{
  "label": "FAKE",
  "confidence": 0.87,
  "text_weight": 0.42,
  "image_weight": 0.28,
  "meta_weight": 0.30,
  "trust_score": 0.52,
  "fact_check_score": 0.65,
  "fact_check_details": {
    "snopes_result": "False",
    "reuters_result": "No result",
    "google_result": "Misinformation"
  },
  "explanations": [
    "High exclamation marks and clickbait indicators detected",
    "Image analysis suggests potential manipulation",
    "Metadata patterns match known fake sources"
  ]
}
```

---

## 🧠 Model Architecture

### Input Branches
- **Text**: PhoBERT-Large tokenizer + encoder → 1024 dims
- **Image**: ResNet18 backbone (ImageNet pretrained) → 128 dims
- **Metadata**: 9 numerical features (length, uppercase, URLs, etc.) → 32 dims

### Processing Pipeline
```
[Text 1024] ──┐
              ├─→ [Concatenate 1184] ──→ [Gated Fusion] 
[Image 128] ──┤                              (softmax weights)
[Meta 32] ────┤                              │
               └─→ [LayerNorm 1184] ──→ [Classifier] ──→ [Output: REAL/FAKE]
```

### Key Features
- **Gated Fusion Network**: Learns optimal weighting of modalities
- **LayerNorm Stabilization**: Prevents gradient explosion
- **Fact-Checking Layer**: Integrates external verification sources
- **Explainability**: Per-modality confidence and human-readable explanations

---

## 📁 Project Structure

```
VinhPhu/
├── backend/
│   ├── app.py                    # FastAPI application
│   ├── model.py                  # MultiModel architecture
│   ├── predictor.py              # Inference + fact-checking
│   ├── database.py               # PostgreSQL integration
│   ├── requirements.txt           # Python dependencies
│   ├── models/
│   │   └── reintel_final_model.pth   # Trained checkpoint
│   └── __init__.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main component
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Feed page
│   │   │   └── PostDetailPage.jsx # Details page
│   │   ├── components/
│   │   │   ├── PostCard.jsx      # Post card widget
│   │   │   └── MetadataSection.jsx
│   │   └── api/
│   │       └── index.js          # API client
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
├── chrome_extension/
│   ├── manifest.json             # Manifest V3
│   ├── content.js                # Page extraction
│   ├── popup.html                # UI
│   ├── popup.js                  # Logic
│   ├── popup.css                 # Styling
│   └── background.js             # Service worker
├── database/
│   └── migrations/
│       ├── 001_create_posts_table.sql
│       └── 002_create_predictions_table.sql
├── scripts/
│   └── import_arrow.py           # Data import script
├── docker-compose.yml
├── Dockerfile
├── DEPLOYMENT.md                 # Deployment guide
├── ARCHITECTURE.md               # Technical details
└── .gitignore
```

---

## 🔒 Security Notes

### Development
- CORS enabled for all origins (localhost testing)
- Rate limiting: 12 requests/60 seconds per IP
- Model runs locally (no external inference)

### Production
- [ ] Restrict CORS to trusted domains
- [ ] Implement JWT authentication
- [ ] Use Redis for distributed rate limiting
- [ ] Enable HTTPS/TLS
- [ ] Set up Web Application Firewall (WAF)
- [ ] Use environment variables for secrets
- [ ] Implement API versioning
- [ ] Add comprehensive logging & monitoring

---

## 📊 Database Schema

### posts table
```sql
id (TEXT PK), post_message (TEXT), user_name (VARCHAR),
timestamp_post (BIGINT), num_like_post (INT), num_comment_post (INT),
num_share_post (INT), engagement_score (FLOAT), text_length (INT),
image_count (INT), label (INT), image_path (TEXT), created_at (TIMESTAMP)
```

### predictions table
```sql
id (BIGSERIAL PK), post_id (TEXT FK), prediction (VARCHAR: REAL/FAKE),
confidence (FLOAT), text_weight (FLOAT), image_weight (FLOAT),
meta_weight (FLOAT), trust_score (FLOAT), created_at (TIMESTAMP)
```

---

## 🧪 Testing

```bash
# Backend health check
curl http://localhost:8000/health

# Test prediction endpoint
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content"}'

# Test data import
python scripts/import_arrow.py --arrow test.parquet \
  --db-url "postgresql://postgres:postgres@localhost:5432/newsguard"

# Test frontend (navigate to http://localhost:5173)
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| PostgreSQL connection fails | Verify service running: `docker ps \| grep postgres` |
| Backend won't start | Check port 8000 availability: `lsof -i :8000` |
| Frontend shows blank page | Check VITE_API_URL env var, browser console errors |
| Extension not extracting data | Verify content.js is injected (check DevTools) |
| Model loading slow | Normal on first run (tokenizer cache), uses GPU if available |

---

## 📚 Documentation

- **API Docs**: http://localhost:8000/docs (interactive Swagger)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Model Details**: See `backend/model.py` docstrings

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add feature'`
3. Push and open Pull Request

---

## 📄 License

This project is provided as-is for educational and research purposes.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review error logs in `docker-compose logs`

---

**Built with ❤️ for misinformation detection**  
*Last Updated: January 2026*
