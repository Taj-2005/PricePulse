# 📈 PricePulse – Amazon Price Tracker & Smart Comparator

**Live Demo:** [https://price-pulse-taj.vercel.app](https://price-pulse-taj.vercel.app)  
**GitHub Repo:** [https://github.com/Taj-2005/PricePulse](https://github.com/Taj-2005/PricePulse)

---

## 🚀 Overview

**PricePulse** is an industry-ready, full-stack price tracking web application that lets users monitor Amazon product prices, set price alerts, and visualize price history. It automatically scrapes product data at regular intervals, stores historical price data, and sends email notifications when prices drop below user-defined thresholds. Built with modern web technologies and best practices.

---

## 🔥 Features

### Core Functionality
- 🔗 **Track Amazon product prices** – Simply paste a product URL to start tracking
- 🕒 **Automatic price updates** – Scheduled scraping every 30-60 minutes via cron jobs
- 📉 **Price history visualization** – Interactive line charts with time filters (24h, 7d, 30d, all time)
- ✉️ **Smart email alerts** – Get notified when prices drop below your target (with duplicate prevention)
- 🎨 **Dark mode support** – Toggle between light and dark themes with persisted preferences
- 📱 **Fully responsive** – Works seamlessly on desktop, tablet, and mobile devices

### Advanced Features
- 🔐 **User authentication** – Secure JWT-based authentication system
- 👤 **User dashboard** – Personal tracking dashboard with product management
- ⚙️ **Robust error handling** – Graceful error messages and retry logic
- 🧠 **AI-powered comparison** (Optional) – Multi-platform price comparison using LLM

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router) – React framework with server-side rendering
- **TypeScript** – Type-safe development
- **TailwindCSS** – Utility-first CSS framework
- **Chart.js** – Interactive price history visualizations
- **React Hot Toast** – Beautiful toast notifications
- **Lucide React** – Modern icon library

### Backend
- **Next.js API Routes** – Serverless API endpoints
- **MongoDB Atlas** – Cloud database for product and user data
- **Mongoose** – MongoDB object modeling and schema management
- **SendGrid** – Email notification service
- **ScraperAPI** – Web scraping service for Amazon product data
- **Cheerio** – Server-side HTML parsing
- **JWT** – Secure authentication tokens
- **Bcrypt** – Password hashing

### Infrastructure
- **Vercel** – Hosting and deployment platform
- **Vercel Cron** – Scheduled job execution (or similar cron service)

---

## 📋 Prerequisites

Before you begin, ensure you have the following:

- **Node.js** 18+ and npm/yarn/pnpm
- **MongoDB Atlas** account (free tier available)
- **ScraperAPI** account (for web scraping)
- **SendGrid** account (for email notifications)
- **Git** (for cloning the repository)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Taj-2005/PricePulse.git
cd PricePulse
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pricepulse?retryWrites=true&w=majority

# ScraperAPI Key (get from https://www.scraperapi.com/)
SCRAPER_API_KEY=your_scraperapi_key_here

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here

# Optional: Cron Secret
CRON_SECRET=your_cron_secret_here
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Set Up Automated Price Checking (Every 30 Minutes) - FREE Options

PricePulse automatically checks product prices every 30 minutes and sends alerts when prices drop. Here are **100% FREE** setup options:

#### Option A: GitHub Actions (Recommended - Completely Free! 🎉)

**Best free solution!** GitHub Actions is free for public repos and offers 2000 free minutes/month for private repos.

1. **The workflow file is already created!** ✅ Check `.github/workflows/price-check-cron.yml`

2. **Add GitHub Secrets:**
   - Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Add these secrets:
     - `APP_URL`: Your deployed app URL (e.g., `https://your-app.vercel.app`)
     - `CRON_SECRET`: Generate with `openssl rand -base64 32`

3. **Push to GitHub** - The workflow automatically runs every 30 minutes!

4. **Verify**: Go to your repo → **Actions** tab → See execution logs

**Benefits:**
- ✅ Completely free for public repos
- ✅ Built-in logging and monitoring
- ✅ Can manually trigger from GitHub UI

#### Option B: Cron-job.org (Free Tier)

1. Sign up at [cron-job.org](https://cron-job.org/) (free account)
2. Create a new cron job:
   - **URL**: `https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET`
   - **Schedule**: `*/30 * * * *` (every 30 minutes)
   - **Method**: GET
   - **Free tier**: 2 cron jobs, 1-minute minimum interval

#### Option C: EasyCron (Free Tier)

1. Sign up at [EasyCron](https://www.easycron.com/)
2. Create a new cron job:
   - **URL**: `https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET`
   - **Schedule**: `*/30 * * * *`
   - **Free tier**: 1 cron job, 1-minute minimum interval

#### Option D: UptimeRobot (Free Tier)

1. Sign up at [UptimeRobot](https://uptimerobot.com/)
2. Create a new monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://your-domain.com/api/cron?secret=YOUR_CRON_SECRET`
   - **Interval**: 30 minutes
   - **Free tier**: 50 monitors, 5-minute minimum interval

#### Option E: Local Development Cron

For testing locally:

```bash
npm run cron:dev
```

This runs price checks every 30 minutes locally. Make sure your `.env.local` has all required variables.

**Important**: Always use the `secret` query parameter with your `CRON_SECRET` value for security!

📖 **For detailed setup instructions, see [AUTOMATION.md](./AUTOMATION.md)**

---

## 📁 Project Structure

```
PricePulse/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── track/       # Product tracking
│   │   │   ├── history/     # Price history
│   │   │   ├── cron/        # Scheduled jobs
│   │   │   └── alerts/      # Alert management
│   │   ├── components/      # React components
│   │   │   ├── TrackingForm.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── ...
│   │   ├── (dashboard)/     # Dashboard pages
│   │   └── layout.tsx       # Root layout
│   ├── lib/                 # Utility functions
│   │   ├── mongodb.ts       # Database connection
│   │   ├── auth.ts          # Authentication helpers
│   │   └── errors.ts        # Error handling
│   ├── models/              # Mongoose schemas
│   │   ├── product.ts       # Price history model
│   │   ├── trackedProduct.ts
│   │   ├── Alert.ts         # Alert model
│   │   └── User.ts          # User model
│   └── services/            # Business logic
│       ├── scraperService.ts
│       ├── emailService.ts
│       ├── alertService.ts
│       └── schedulerService.ts
├── public/                  # Static assets
├── .env.example            # Environment variables template
└── README.md
```

---

## 🏗️ Architecture

### Database Schema

**TrackedProduct**
- `url` (String, unique) – Amazon product URL
- `title` (String) – Product name
- `currentPrice` (Number) – Latest price
- `imageUrl` (String) – Product image
- `userEmail` (String) – User who tracks this product
- `lastScrapedAt` (Date) – Last update timestamp

**PriceHistory**
- `productUrl` (String, indexed) – Reference to product
- `price` (Number) – Historical price
- `timestamp` (Date, indexed) – When price was recorded

**Alert**
- `productId` (ObjectId) – Reference to TrackedProduct
- `userEmail` (String) – Alert recipient
- `targetPrice` (Number) – Price threshold
- `alerted` (Boolean) – Prevents duplicate alerts
- `lastAlertPrice` (Number) – Last price we alerted at

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/track` | POST | Start tracking a product |
| `/api/history?url=...&filter=...` | GET | Get price history with time filter |
| `/api/alerts` | POST | Create/update alert |
| `/api/alerts?productId=...` | GET | Get alerts for a product |
| `/api/cron` | GET | Run scheduled price updates |
| `/api/tracked?userEmail=...` | GET | Get user's tracked products |

### Flow Diagram

```
User Input (URL + Email + Target Price)
    ↓
POST /api/track
    ↓
Scrape Product (ScraperAPI)
    ↓
Save to TrackedProduct + PriceHistory
    ↓
Create Alert (if target price provided)
    ↓
Return Product Data
    ↓
Frontend displays product card + chart

[Every 30-60 minutes]
    ↓
Cron Job → /api/cron
    ↓
For each TrackedProduct:
    - Scrape current price
    - Save to PriceHistory
    - Check alerts
    - Send email if price ≤ target
```

---

## 🎨 UI/UX Features

- **Modern Dashboard Design** – Clean, card-based layout
- **Dark Mode** – Toggle with system preference detection
- **Time Filters** – View price history for 24h, 7d, 30d, or all time
- **Product Cards** – Beautiful product previews with images
- **Loading States** – Skeleton loaders and spinners
- **Error Handling** – User-friendly error messages
- **Responsive Design** – Mobile-first approach

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Environment variable protection
- Input validation and sanitization
- Rate limiting (via ScraperAPI)
- Secure email sending (SendGrid)

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## 📝 Limitations & Notes

1. **Scraping Rate Limits**: ScraperAPI has rate limits based on your plan. Free tier allows limited requests.
2. **Amazon Blocking**: Amazon may block scraping attempts. ScraperAPI helps mitigate this.
3. **Email Deliverability**: Ensure SendGrid domain is verified for better deliverability.
4. **Cron Jobs**: Free hosting platforms may have limitations on cron job frequency.
5. **Database Size**: Price history can grow large over time. Consider archiving old data.

---

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Set Up Automated Price Checking

**Recommended: Use GitHub Actions (100% Free!)**

The workflow file is already created at `.github/workflows/price-check-cron.yml`. Just:
1. Add `APP_URL` and `CRON_SECRET` to GitHub Secrets
2. Push to GitHub - it will run automatically every 30 minutes!

**Alternative: Use free external cron services** like Cron-job.org, EasyCron, or UptimeRobot.

📖 **See [AUTOMATION.md](./AUTOMATION.md) for detailed setup instructions.**

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Taj**
- GitHub: [@Taj-2005](https://github.com/Taj-2005)
- Live Demo: [PricePulse](https://price-pulse-taj.vercel.app)

---

## 🙏 Acknowledgments

- ScraperAPI for web scraping infrastructure
- SendGrid for email delivery
- MongoDB Atlas for database hosting
- Vercel for hosting and deployment

---

**Made with ❤️ for smart shoppers**
