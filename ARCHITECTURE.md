# 🏗️ PricePulse Architecture Documentation

## Overview

PricePulse follows a modern, modular architecture with clear separation of concerns. The application is built using Next.js 15 with the App Router, TypeScript, and MongoDB.

## Architecture Layers

### 1. Frontend Layer (`src/app/`)

#### Components (`src/app/components/`)
- **TrackingForm.tsx** - Main form for tracking products with dark mode support
- **DashboardClient.tsx** - User dashboard with product list and charts
- **TrackedList.tsx** - Grid display of tracked products
- **ThemeProvider.tsx** - Dark mode theme management
- **ThemeToggle.tsx** - Theme switcher button
- **Navbar.tsx** - Navigation bar with theme toggle

#### Pages (`src/app/`)
- **page.tsx** - Landing page
- **dashboard/page.tsx** - User dashboard
- **login/page.tsx** - Login page
- **signup/page.tsx** - Registration page

### 2. API Layer (`src/app/api/`)

#### Endpoints

**Authentication**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/signout` - User logout

**Product Tracking**
- `POST /api/track` - Start tracking a product
  - Body: `{ url, userEmail?, targetPrice? }`
  - Returns: Product data with current price

**Price History**
- `GET /api/history?url=...&filter=...` - Get price history
  - Query params:
    - `url` (required) - Product URL
    - `filter` (optional) - Time filter: `24h`, `7d`, `30d`, `all`

**Alerts**
- `POST /api/alerts` - Create/update alert
  - Body: `{ productId, userEmail, targetPrice }`
- `GET /api/alerts?productId=...` - Get alerts for a product
- `DELETE /api/alerts?id=...` - Delete an alert

**Scheduled Jobs**
- `GET /api/cron` - Run scheduled price updates
  - Processes all tracked products
  - Updates prices and sends alerts

**Dashboard**
- `GET /api/tracked?userEmail=...` - Get user's tracked products
- `GET /api/dashboard` - Get dashboard data (with auth)

### 3. Services Layer (`src/services/`)

#### scraperService.ts
- **Purpose**: Web scraping logic
- **Functions**:
  - `scrapeProduct(url, retries)` - Scrape Amazon product data
  - Returns: `{ title, price, priceNumber, imageUrl, brand }`

#### emailService.ts
- **Purpose**: Email notification handling
- **Functions**:
  - `sendEmail(options)` - Generic email sender
  - `sendPriceAlertEmail(...)` - Send price drop alert

#### alertService.ts
- **Purpose**: Alert management and deduplication
- **Functions**:
  - `checkAndSendAlert(productId, currentPrice)` - Check conditions and send alerts
  - `createOrUpdateAlert(...)` - Create/update alert record
  - `resetAlertIfPriceAboveTarget(...)` - Reset alert when price goes up

#### schedulerService.ts
- **Purpose**: Batch processing of tracked products
- **Functions**:
  - `runScheduler()` - Main scheduler function
  - Processes products in batches
  - Updates prices and triggers alerts

### 4. Data Layer (`src/models/`)

#### TrackedProduct
```typescript
{
  url: string (unique),
  title: string,
  currentPrice: number,
  imageUrl?: string,
  brand?: string,
  model?: string,
  userEmail?: string,
  lastScrapedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### PriceHistory
```typescript
{
  productUrl: string (indexed),
  price: number,
  timestamp: Date (indexed)
}
```

#### Alert
```typescript
{
  productId: ObjectId (ref: TrackedProduct),
  userEmail: string,
  targetPrice: number,
  alerted: boolean (default: false),
  lastAlertPrice?: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### User
```typescript
{
  email: string (unique),
  passwordHash: string
}
```

### 5. Utilities (`src/lib/`)

- **mongodb.ts** - Database connection helper
- **auth.ts** - JWT authentication utilities
- **errors.ts** - Error message formatting
- **verifyJWT.ts** - JWT verification

## Data Flow

### Product Tracking Flow

```
1. User submits form (URL + optional email + target price)
   ↓
2. POST /api/track
   ↓
3. scraperService.scrapeProduct(url)
   ↓
4. Save to TrackedProduct (upsert)
   ↓
5. Save to PriceHistory
   ↓
6. If targetPrice provided:
   - Create/update Alert
   - Check if immediate alert needed
   ↓
7. Return product data to frontend
   ↓
8. Frontend fetches history and displays chart
```

### Scheduled Price Update Flow

```
1. Cron job triggers GET /api/cron (every 30-60 min)
   ↓
2. schedulerService.runScheduler()
   ↓
3. Fetch all TrackedProduct documents
   ↓
4. Process in batches (5 at a time):
   For each product:
     a. scrapeProduct(url)
     b. Save to PriceHistory
     c. Update TrackedProduct.currentPrice
     d. alertService.checkAndSendAlert()
        - Check if price ≤ targetPrice
        - Check if already alerted
        - Send email if conditions met
        - Update alert.alerted flag
   ↓
5. Return summary (success/failed counts)
```

### Alert Deduplication Logic

```
When price drops below target:
1. Check if alert.alerted === false
   OR
2. Check if currentPrice < alert.lastAlertPrice
   ↓
If true:
  - Send email
  - Set alert.alerted = true
  - Set alert.lastAlertPrice = currentPrice
Else:
  - Skip (already alerted for this price)
```

## Security Considerations

1. **Authentication**: JWT tokens stored in localStorage
2. **Password Hashing**: Bcrypt with salt rounds
3. **Input Validation**: All API endpoints validate input
4. **Environment Variables**: Sensitive data in .env.local
5. **Rate Limiting**: Handled by ScraperAPI
6. **CORS**: Configured for production domain

## Error Handling

### Scraping Errors
- Retry logic (3 attempts with exponential backoff)
- User-friendly error messages
- Graceful degradation

### Email Errors
- Logged but don't break the flow
- Retry on next cron run

### Database Errors
- Connection pooling
- Automatic reconnection
- Error logging

## Performance Optimizations

1. **Database Indexing**:
   - `productUrl` indexed in PriceHistory
   - `timestamp` indexed for time-based queries
   - Compound indexes for common queries

2. **Batch Processing**:
   - Process products in batches of 5
   - Delay between batches to avoid rate limits

3. **Caching**:
   - Consider adding Redis for frequently accessed data

4. **Frontend**:
   - Client-side filtering for time ranges
   - Lazy loading for charts
   - Optimized re-renders with React hooks

## Deployment Architecture

```
┌─────────────┐
│   Vercel    │
│  (Frontend) │
└──────┬──────┘
       │
       ├─── API Routes (Serverless Functions)
       │
       ├─── Static Assets (CDN)
       │
┌──────┴──────┐
│   MongoDB   │
│    Atlas    │
└─────────────┘

External Services:
- ScraperAPI (Web Scraping)
- SendGrid (Email)
- Vercel Cron (Scheduled Jobs)
```

## Future Enhancements

1. **Multi-platform Comparison**:
   - AI-powered product matching
   - Scrape Flipkart, Meesho, etc.
   - Comparison table UI

2. **Real-time Updates**:
   - WebSocket support
   - Push notifications

3. **Advanced Analytics**:
   - Price prediction
   - Best time to buy
   - Historical trends

4. **User Features**:
   - Product collections
   - Price drop history
   - Share tracking links

## Monitoring & Logging

- Console logging for development
- Consider adding:
  - Sentry for error tracking
  - Analytics for user behavior
  - Uptime monitoring
  - Database query performance monitoring

