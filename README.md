# 🚛 GPS Trucks Japan

A comprehensive Japanese car export platform that focuses on trucks, SUVs, and commercial vehicles. Built for exporting Japanese vehicles worldwide with American English service.

## 🎯 Features

- **Vehicle Catalog**: Browse trucks, SUVs, and commercial vehicles from Japan
- **Automated Scraping**: Scrape CarSensor.net and other Japanese car sites
- **Admin Panel**: Complete management system for vehicles, inquiries, and scrapers
- **Export Calculator**: Calculate shipping costs and export procedures
- **Self-hosted Images**: Download and optimize all vehicle images locally
- **Inquiry Management**: Handle customer inquiries and quotes
- **Multi-language Support**: English interface for international customers

## 🏗️ Architecture

```
├── frontend/          # Public website (React/Next.js) - Port 3000
├── admin/            # Admin panel (React/Next.js) - Port 3001  
├── backend/          # API server (Node.js/Express) - Port 3002
├── scrapers/         # Python scrapers (Playwright)
├── database/         # PostgreSQL schema and migrations
└── docker-compose.yml # Development environment
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Python 3.8+
- PostgreSQL (or use Docker)

### 1. Clone and Setup
```bash
git clone <your-repo>
cd GPSTrucksJapan

# Run the automated setup script
./setup-dev.sh
```

### 2. Start Development
```bash
# Start all services
npm run dev

# OR start individually:
npm run dev:backend   # API server
npm run dev:frontend  # Public website
npm run dev:admin     # Admin panel
```

### 3. Access the Application
- **Public Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3001
- **API**: http://localhost:3002

### 4. Admin Access
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@gpstrucksjapan.com`

## 📊 Database

The platform uses PostgreSQL with comprehensive schema for:
- Vehicle catalog with specifications
- Self-hosted image management
- Customer inquiries and leads
- Scraper monitoring and logs
- Admin user management

### Database Setup
```bash
# With Docker (recommended)
docker-compose up -d postgres

# Manual setup
cd database
./setup.sh
```

## 🕷️ Web Scraping

### Supported Sites
- **CarSensor.net** - Primary source for vehicles
- **Goo-net** - Secondary source (coming soon)

### Scraper Features
- Playwright for JavaScript-heavy sites
- Image downloading and optimization
- Automatic data deduplication
- Scheduled scraping
- Error handling and logging

### Running Scrapers
```bash
cd scrapers
source venv/bin/activate
python main.py
```

## 🎨 Frontend

### Public Website (`localhost:3000`)
- Vehicle search and filtering
- Detailed vehicle pages with image galleries
- Export cost calculator
- Inquiry forms
- Mobile-responsive design

### Admin Panel (`localhost:3001`)
- Vehicle management (CRUD)
- Image upload and management
- Inquiry handling
- Scraper monitoring
- Analytics dashboard

## 🔧 Backend API

RESTful API built with Node.js/Express:

### Key Endpoints
```
GET  /api/vehicles/search    # Search vehicles
GET  /api/vehicles/:id       # Get vehicle details
POST /api/inquiries         # Submit inquiry
GET  /api/admin/dashboard   # Admin statistics
```

### Features
- TypeScript for type safety
- JWT authentication
- Rate limiting
- Image upload handling
- Database optimization

## 🖼️ Image Management

Self-hosted image system with:
- Automatic downloading from scraped sources
- Multiple sizes (thumbnail, medium, full)
- Image optimization and compression
- Organized directory structure
- Source URL tracking for updates

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly image galleries
- Mobile-optimized search filters
- Fast loading on mobile networks

## 🔐 Security

- Helmet.js for security headers
- Rate limiting on API endpoints
- Input validation and sanitization
- CSRF protection
- Secure image uploads

## 📈 Performance

- Database indexing for fast searches
- Image lazy loading
- API response caching
- Optimized SQL queries
- CDN-ready image structure

## 🛠️ Development

### Project Structure
```
├── frontend/src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Next.js pages
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Utility functions
├── backend/src/
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── models/        # Database models
│   └── utils/         # Helper functions
├── scrapers/
│   ├── main.py        # Main scraper orchestrator
│   ├── carsensor_scraper.py
│   └── image_processor.py
└── database/
    ├── schema.sql     # Database schema
    └── migrations/    # Schema migrations
```

### Available Scripts
```bash
npm run dev           # Start all services
npm run build         # Build all applications
npm run test          # Run tests
npm run lint          # Lint code
npm run typecheck     # TypeScript checking
npm run scrape        # Run scrapers
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
- Database connection
- JWT secrets
- Email settings (for inquiries)
- External API keys

## 🚢 Deployment

### Production Setup
1. Configure environment variables
2. Set up PostgreSQL database
3. Build applications: `npm run build`
4. Set up reverse proxy (nginx)
5. Configure SSL certificates
6. Set up monitoring and backups

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📋 TODO / Roadmap

- [ ] Complete CarSensor scraper implementation
- [ ] Add Goo-net scraper
- [ ] Implement real-time notifications
- [ ] Add more payment integrations
- [ ] Multi-language support (Japanese)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support:
- Email: support@gpstrucksjapan.com
- Documentation: Check the `/docs` folder
- Issues: Create a GitHub issue

## 🗂️ Large Files Not in Version Control

The following large binary files are excluded from git due to GitHub's 100MB file size limit:
- `google-chrome-stable_current_amd64.deb` (112.45 MB) - Chrome browser installer
- `cloudflared.deb` - Cloudflare Tunnel installer
- `scrapers/google-chrome-stable_current_amd64.deb` - Chrome installer copy
- `cloudflared` - Cloudflare Tunnel binary

These files exist locally but are ignored by git. Install them separately:
```bash
# Install Chrome (for scrapers)
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt update && sudo apt install google-chrome-stable

# Install Cloudflare Tunnel
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

## 🌐 Translation System

The project includes an automated Japanese title translation system:
- **Script**: `translate_titles.py` - Translates Japanese vehicle titles to English using Google Translate API
- **Usage**: `python3 translate_titles.py`
- **Features**: Batch processing, rate limiting, translation cleanup, error handling
- **Database**: Targets vehicles with Japanese characters using regex `[ぁ-んァ-ヶー]`

---

**Made with ❤️ for Japanese car enthusiasts worldwide**