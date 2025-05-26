# 📈 PricePulse – Amazon Price Tracker & Multi-Platform Comparator

<!-- optional -->

**Live Demo:** [https://pricepulse.vercel.app](https://pricepulse.vercel.app)
**GitHub Repo:** [https://github.com/Taj-2005/PricePulse](https://github.com/Taj-2005/PricePulse)

---

## 🚀 Overview

**PricePulse** is a fullstack price tracking web app that lets users monitor Amazon product prices, set alerts, and compare prices across platforms like Flipkart. It scrapes real-time product data, stores price history, and sends email alerts when prices drop below your desired threshold. Designed for everyday shoppers looking to make smarter, more timely purchase decisions.

---

## 🔥 Features

- 🔗 **Track Amazon product prices**
- 🕒 **30-minute interval price updates**
- 📉 **Historical price graph (48 data points/day)**
- ✉️ **Email alerts when prices fall below your target**
- 🧠 **LLM-powered alternate price comparison across platforms (Flipkart, etc.)**
- 🔐 **Secure user authentication**
- 👤 **User-specific product tracking dashboard**
- ⚙️ **Robust cron job scheduler for background scraping**

---

## 🛠️ Tech Stack

### 🎯 Frontend

- **Next.js 14 (App Router)**
- **TailwindCSS** – modern utility-first styling
- **Chart.js** – price history visualizations
- **Shadcn/ui** – beautifully styled UI components
- **Recharts (optional alt use case)**

### 🧠 Backend

- **Next.js API Routes**
- **MongoDB Atlas** – product and user data
- **Mongoose** – schema modeling and queries
- **SendGrid SMTP** – for sending alert emails
- **Cheerio + Axios + ScraperAPI** – HTML parsing & scraping Amazon product data
- **jsonwebtoken (JWT)** – user authentication and protected routes
- **Bcrypt** – secure password hashing

### 🧪 AI/LLM Feature (Bonus)

- **OpenAI/Gemini API** – used to extract metadata from Amazon links and generate search queries for alternate platforms like Flipkart.


---

## 🧑‍💻 How It Works

### 🧾 1. User Flow

- User registers and logs in
- Enters an Amazon product URL, optional email & desired price
- PricePulse scrapes product info and adds it to MongoDB
- Every 30 minutes, a cron job re-scrapes tracked products
- If current price ≤ user’s target, an alert email is sent

### 🧠 2. Bonus LLM Feature

- A product's metadata is sent to LLM
- Search queries are generated dynamically for Flipkart
- PricePulse scrapes alternate platform listings and displays price comparisons

---
