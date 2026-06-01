# Multimodal Fake News Detection Platform - Setup & Deployment

## 📋 System Requirements

- **OS**: Linux/macOS/Windows (with WSL recommended for Windows)
- **Python**: 3.12+
- **Node.js**: 20+ (for React frontend)
- **Docker**: Latest (with NVIDIA Docker runtime for GPU support)
- **PostgreSQL**: 15+ (can use Docker)
- **Chrome/Chromium**: Latest version (for extension testing)
- **GPU**: NVIDIA CUDA 12.1+ compatible (optional but recommended)

## 🚀 Quick Start (Docker)

### 1. Clone & Setup

```bash
cd VinhPhu
```

### 2. Build & Run with Docker Compose

```bash
# Build all services
docker-compose build

# Start all services (postgres, backend, frontend)
docker-compose up -d

# Check service status
docker-compose ps
```

Services will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Database**: postgres://localhost:5432/newsguard (postgres/postgres)

### 3. Verify Setup

```bash
# Check backend health
curl http://localhost:8000/health

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

## 🔧 Manual Setup (Development)

### Backend Setup

#### Step 1: Create Python Environment

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

#### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 3: Set Environment Variables

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/newsguard"
export CHECKPOINT_PATH="./backend/models/reintel_final_model.pth"
```

#### Step 4: Start Backend

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

#### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

#### Step 2: Configure API URL

Create `.env.local`:
```
VITE_API_URL=http://localhost:8000
```

#### Step 3: Start Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### PostgreSQL Setup

#### Option A: Docker (Recommended)

```bash
docker run -d \
  --name newsguard_db \
  -e POSTGRES_DB=newsguard \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

#### Option B: Local PostgreSQL

Install PostgreSQL locally, create database:

```bash
createdb newsguard
```

#### Run Migrations

```bash
psql -U postgres -d newsguard -f database/migrations/001_create_posts_table.sql
psql -U postgres -d newsguard -f database/migrations/002_create_predictions_table.sql
```

## 📦 Data Import

### Import Arrow Dataset to PostgreSQL

```bash
python scripts/import_arrow.py \
  --arrow /path/to/dataset.parquet \
  --db-url "postgresql://postgres:postgres@localhost:5432/newsguard" \
  --output-dir uploads/images
```

This will:
1. Extract images from Arrow binary columns
2. Calculate engagement scores and metadata
3. Populate PostgreSQL posts table

## 🧩 Chrome Extension Setup

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `chrome_extension/` folder
5. Verify extension appears in toolbar

### Test Extension

1. Navigate to any website with article-like content
2. Click extension icon (📰 NewsGuard)
3. Click "Analyze Page" button
4. View prediction results

**Note**: Ensure backend is running on `http://localhost:8000`

## 📊 API Endpoints

### Prediction
- **POST** `/predict` - Run inference on content
  ```json
  {
    "title": "Article Title",
    "content": "Article content...",
    "image_url": "https://example.com/image.jpg"
  }
  ```

### Posts Management
- **GET** `/posts?page=1&limit=20` - List posts
- **GET** `/posts/{id}` - Get single post
- **GET** `/posts/trending` - Trending posts (by engagement)
- **GET** `/posts/latest` - Latest posts
- **GET** `/posts/search?q=query` - Search posts
- **GET** `/posts/{id}/predictions` - Get predictions for post

### Statistics
- **GET** `/stats` - Get platform statistics
- **GET** `/health` - Health check

## 🔐 Production Hardening

### Security Checklist

- [ ] Disable CORS for specific domains only
- [ ] Implement API rate limiting
- [ ] Add authentication/authorization
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS with valid certificates
- [ ] Set up WAF (Web Application Firewall)
- [ ] Implement CSRF protection

### Performance Optimization

- [ ] Use Redis for caching
- [ ] Implement query pagination
- [ ] Add database indexes (already included in migrations)
- [ ] Use connection pooling (PgBouncer)
- [ ] Enable gzip compression
- [ ] Use CDN for static assets

### Deployment

#### Option A: Cloud (Recommended)

1. **AWS ECS/Lambda**
   ```bash
   # Build Docker image
   docker build -t newsguard-backend .
   docker tag newsguard-backend:latest ACCOUNT.dkr.ecr.REGION.amazonaws.com/newsguard-backend
   docker push ACCOUNT.dkr.ecr.REGION.amazonaws.com/newsguard-backend
   ```

2. **Google Cloud Run**
   ```bash
   gcloud run deploy newsguard-backend \
     --image gcr.io/PROJECT_ID/newsguard-backend \
     --platform managed \
     --region us-central1
   ```

3. **Heroku**
   ```bash
   heroku login
   heroku create newsguard-app
   git push heroku main
   ```

#### Option B: Self-Hosted VPS

1. **SSH into VPS**
   ```bash
   ssh user@your-vps.com
   ```

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

3. **Deploy with Docker Compose**
   ```bash
   git clone <your-repo>
   cd VinhPhu
   docker-compose up -d
   ```

4. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     
     location /api {
       proxy_pass http://localhost:8000;
     }
     
     location / {
       proxy_pass http://localhost:5173;
     }
   }
   ```

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Test

```bash
# 1. Start all services
docker-compose up -d

# 2. Wait for services to be ready
sleep 10

# 3. Import test data
python scripts/import_arrow.py \
  --arrow /path/to/test.parquet \
  --db-url "postgresql://postgres:postgres@localhost:5432/newsguard"

# 4. Test API
curl -X GET http://localhost:8000/posts

# 5. Test prediction
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "content": "This is a test article content",
    "image_url": "https://example.com/image.jpg"
  }'
```

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```bash
# Check if service is running
docker ps | grep postgres

# Verify connection
psql -h localhost -U postgres -d newsguard
```

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.12+

# Check dependencies
pip list | grep fastapi

# Check port availability
lsof -i :8000
```

### Frontend Build Error
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Chrome Extension Not Loading
```
1. Check extension folder has manifest.json
2. Verify content.js and popup.js exist
3. Check browser console for errors
4. Reload extension after code changes
```

## 📚 Project Structure

```
VinhPhu/
├── backend/
│   ├── app.py           # FastAPI application
│   ├── model.py         # PyTorch model definition
│   ├── predictor.py     # Inference pipeline
│   ├── database.py      # PostgreSQL helpers
│   ├── requirements.txt # Python dependencies
│   ├── models/
│   │   └── reintel_final_model.pth
│   └── __init__.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main React component
│   │   ├── main.jsx     # Entry point
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   └── api/         # API client
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
├── chrome_extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   ├── background.js
│   └── popup.css
├── database/
│   └── migrations/
│       ├── 001_create_posts_table.sql
│       └── 002_create_predictions_table.sql
├── scripts/
│   └── import_arrow.py  # Data import script
├── docker-compose.yml
├── Dockerfile
└── .gitignore
```

## 📞 Support & Documentation

- **API Docs**: http://localhost:8000/docs (interactive Swagger UI)
- **Model Info**: See `backend/model.py` for architecture details
- **Extension Guide**: See `chrome_extension/manifest.json`

## 📝 License

This project is provided as-is for educational and research purposes.

---

**Last Updated**: January 2026
**Maintained By**: Development Team
